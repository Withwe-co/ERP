# server/app/core/migration.py
"""
데이터베이스 마이그레이션 스크립트
기존 데이터를 손실 없이 새로운 통합 구조로 이전
"""

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import engine, SessionLocal
from app.models.inventory import Inventory
from app.models.receipt import Receipt
from app.models.unified_inventory import UnifiedInventory, InventoryImage
import logging
from datetime import datetime
from typing import Dict, List

logger = logging.getLogger(__name__)

def migrate_database():
    """데이터베이스 마이그레이션 실행"""
    db = SessionLocal()
    try:
        logger.info(" 데이터베이스 마이그레이션 시작...")
        create_new_tables()
        add_receipt_columns(db)
        migrate_inventory_data(db)
        link_receipt_data(db)
        update_unified_inventory_from_receipts(db)
        # Receipt 테이블 삭제
        db.execute(text("DROP TABLE IF EXISTS receipts"))
        db.commit()
        logger.info("Receipt 테이블 삭제 완료")
        logger.info("데이터베이스 마이그레이션 완료!")
    except Exception as e:
        logger.error(f"마이그레이션 실패: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def create_new_tables():
    """새로운 테이블들 생성"""
    from app.models.unified_inventory import UnifiedInventory, InventoryImage
    
    # 테이블 생성
    UnifiedInventory.__table__.create(bind=engine, checkfirst=True)
    InventoryImage.__table__.create(bind=engine, checkfirst=True)
    
    logger.info("새 테이블 생성 완료")

def add_receipt_columns(db: Session):
    """Receipt 테이블에 새 컬럼 추가"""
    try:
        # unified_inventory_id 컬럼 추가
        db.execute(text("""
            ALTER TABLE receipts 
            ADD COLUMN IF NOT EXISTS unified_inventory_id INTEGER
        """))
        
        # 외래키 제약조건 추가 (PostgreSQL용)
        db.execute(text("""
            ALTER TABLE receipts 
            ADD CONSTRAINT IF NOT EXISTS fk_receipts_unified_inventory 
            FOREIGN KEY (unified_inventory_id) REFERENCES unified_inventory(id)
        """))
        
        db.commit()
        logger.info("Receipt 테이블 컬럼 추가 완료")
        
    except Exception as e:
        # SQLite의 경우 IF NOT EXISTS가 지원되지 않을 수 있음
        logger.warning(f"컬럼 추가 중 경고 (이미 존재할 수 있음): {e}")
        db.rollback()

def migrate_inventory_data(db: Session):
    """기존 Inventory 데이터를 UnifiedInventory로 마이그레이션"""
    inventories = db.query(Inventory).all()
    
    for inventory in inventories:
        # 기존 재고 데이터를 통합 테이블로 복사
        unified_item = UnifiedInventory(
            item_code=inventory.item_code,
            item_name=inventory.item_name,
            category=inventory.category,
            brand=inventory.brand,
            current_quantity=inventory.current_stock,
            minimum_stock=inventory.minimum_stock,
            maximum_stock=inventory.maximum_stock,
            unit_price=inventory.unit_price,
            currency=inventory.currency,
            supplier_name=inventory.supplier_name,
            supplier_contact=inventory.supplier_contact,
            location=inventory.location,
            warehouse=inventory.warehouse,
            is_active=inventory.is_active,
            description=inventory.description,
            created_at=inventory.created_at,
            updated_at=inventory.updated_at,
            # 수령 정보는 나중에 Receipt에서 업데이트
            total_received=inventory.current_stock,  # 임시값
            last_received_date=inventory.created_at,  # 임시값
        )
        
        db.add(unified_item)
    
    db.commit()
    logger.info(f"{len(inventories)}개의 Inventory 데이터 마이그레이션 완료")

def link_receipt_data(db: Session):
    """Receipt 데이터를 UnifiedInventory와 연결"""
    receipts = db.query(Receipt).all()
    
    for receipt in receipts:
        # 품목명으로 UnifiedInventory 찾기 (정확한 매칭)
        unified_item = db.query(UnifiedInventory).filter(
            UnifiedInventory.item_name == receipt.item_name
        ).first()
        
        if not unified_item:
            # 새로운 품목인 경우 UnifiedInventory 생성
            unified_item = create_unified_item_from_receipt(db, receipt)
        
        # Receipt에 unified_inventory_id 설정
        receipt.unified_inventory_id = unified_item.id
    
    db.commit()
    logger.info(f"{len(receipts)}개의 Receipt 데이터 연결 완료")

def create_unified_item_from_receipt(db: Session, receipt: Receipt) -> UnifiedInventory:
    """Receipt 정보로부터 새로운 UnifiedInventory 생성"""
    # 품목 코드 생성 (없는 경우)
    item_code = generate_item_code(db, receipt.item_name)
    
    unified_item = UnifiedInventory(
        item_code=item_code,
        item_name=receipt.item_name,
        specifications=receipt.specifications,
        total_received=receipt.received_quantity,
        current_quantity=receipt.received_quantity,
        unit=receipt.unit,
        supplier_name=receipt.supplier_name,
        location=receipt.location,
        last_received_date=receipt.received_date,
        last_received_by=receipt.receiver_name,
        last_received_department=receipt.department,
        condition_quantities={
            receipt.condition.value: receipt.received_quantity,
            "excellent": 0,
            "good": 0,
            "damaged": 0,
            "defective": 0
        },
        created_at=receipt.received_date,
        is_active=True
    )
    
    # 상태별 수량 설정
    unified_item.condition_quantities[receipt.condition.value] = receipt.received_quantity
    
    db.add(unified_item)
    db.flush()  # ID 얻기 위해
    
    return unified_item

def update_unified_inventory_from_receipts(db: Session):
    """Receipt 데이터를 기반으로 UnifiedInventory 정보 업데이트"""
    unified_items = db.query(UnifiedInventory).all()
    
    for item in unified_items:
        # 해당 품목의 모든 Receipt 조회
        receipts = db.query(Receipt).filter(
            Receipt.unified_inventory_id == item.id
        ).order_by(Receipt.received_date.desc()).all()
        
        if receipts:
            # 수령 이력 리스트 생성
            receipt_history = []
            condition_quantities = {
                "excellent": 0,
                "good": 0,
                "damaged": 0,
                "defective": 0
            }
            
            for receipt in receipts:
                # SQLAlchemy 객체의 속성에 직접 접근
                receipt_data = {
                    "receipt_number": receipt.receipt_number or "N/A",
                    "item_name": receipt.item_name or item.item_name,
                    "expected_quantity": receipt.expected_quantity or receipt.received_quantity,
                    "received_quantity": receipt.received_quantity,
                    "receiver_name": receipt.receiver_name,
                    "receiver_email": receipt.receiver_email,
                    "department": receipt.department,
                    "received_date": receipt.received_date.isoformat() if receipt.received_date else "",
                    "location": receipt.location,
                    "condition": receipt.condition.value if hasattr(receipt.condition, 'value') else str(receipt.condition),
                    "notes": receipt.notes,
                    "image_urls": []  # 이미지는 별도 테이블에서 관리
                }
                receipt_history.append(receipt_data)
                
                # 상태별 수량 업데이트
                condition_key = receipt_data["condition"]
                if condition_key in condition_quantities:
                    condition_quantities[condition_key] += receipt.received_quantity
            
            # 총 수령 수량 계산
            total_received = sum(r.received_quantity for r in receipts)
            
            # 최근 수령 정보
            latest_receipt = receipts[0]
            
            # UnifiedInventory 업데이트
            item.receipt_history = receipt_history
            item.total_received = total_received
            item.current_quantity = total_received  # 초기값 (사용 이력이 없다고 가정)
            item.condition_quantities = condition_quantities
            item.last_received_date = latest_receipt.received_date
            item.last_received_by = latest_receipt.receiver_name
            item.last_received_department = latest_receipt.department
            
            # 공급업체 정보 업데이트
            if latest_receipt.supplier_name:
                item.supplier_name = latest_receipt.supplier_name
            if latest_receipt.location:
                item.location = latest_receipt.location
    
    db.commit()
    logger.info("UnifiedInventory 정보 및 receipt_history 업데이트 완료")
    
def generate_item_code(db: Session, item_name: str) -> str:
    """품목명 기반으로 고유한 품목 코드 생성"""
    # 품목명의 첫 글자들로 prefix 생성
    words = item_name.split()
    if len(words) >= 2:
        prefix = ''.join(word[0].upper() for word in words[:2])
    else:
        prefix = item_name[:2].upper()
    
    # 기존 코드와 중복되지 않는 번호 찾기
    counter = 1
    while True:
        code = f"{prefix}{counter:04d}"
        existing = db.query(UnifiedInventory).filter(
            UnifiedInventory.item_code == code
        ).first()
        if not existing:
            return code
        counter += 1

def rollback_migration(db: Session):
    """마이그레이션 롤백"""
    try:
        # Receipt 테이블 복원
        db.execute(text("""
            CREATE TABLE receipts (
                id INTEGER PRIMARY KEY,
                unified_inventory_id INTEGER,
                receipt_number VARCHAR(50) UNIQUE NOT NULL,
                item_name VARCHAR(200) NOT NULL,
                expected_quantity INTEGER NOT NULL,
                received_quantity INTEGER NOT NULL,
                receiver_name VARCHAR(100) NOT NULL,
                receiver_email VARCHAR(255),
                department VARCHAR(100) NOT NULL,
                received_date TIMESTAMP WITH TIME ZONE NOT NULL,
                location VARCHAR(200),
                condition VARCHAR(50),
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE,
                created_by VARCHAR(100),
                updated_by VARCHAR(100),
                FOREIGN KEY (unified_inventory_id) REFERENCES unified_inventory(id)
            )
        """))
        
        # receipt_history 데이터를 Receipt 테이블로 복원
        unified_items = db.query(UnifiedInventory).all()
        for item in unified_items:
            for receipt in item.receipt_history or []:
                db.execute(
                    text("""
                        INSERT INTO receipts (
                            unified_inventory_id, receipt_number, item_name, expected_quantity,
                            received_quantity, receiver_name, receiver_email, department,
                            received_date, location, condition, notes, created_at
                        ) VALUES (:unified_inventory_id, :receipt_number, :item_name, :expected_quantity,
                                 :received_quantity, :receiver_name, :receiver_email, :department,
                                 :received_date, :location, :condition, :notes, :created_at)
                    """),
                    {
                        "unified_inventory_id": item.id,
                        "receipt_number": receipt["receipt_number"],
                        "item_name": receipt["item_name"],
                        "expected_quantity": receipt["expected_quantity"],
                        "received_quantity": receipt["received_quantity"],
                        "receiver_name": receipt["receiver_name"],
                        "receiver_email": receipt["receiver_email"],
                        "department": receipt["department"],
                        "received_date": receipt["received_date"],
                        "location": receipt["location"],
                        "condition": receipt["condition"],
                        "notes": receipt["notes"],
                        "created_at": datetime.now()
                    }
                )
        
        # 새 테이블들 삭제
        db.execute(text("DROP TABLE IF EXISTS inventory_images"))
        db.execute(text("DROP TABLE IF EXISTS inventory_usage_logs"))
        db.execute(text("DROP TABLE IF EXISTS unified_inventory"))
        
        db.commit()
        logger.info("마이그레이션 롤백 완료")
    except Exception as e:
        logger.error(f"롤백 실패: {e}")
        db.rollback()
        raise

if __name__ == "__main__":
    migrate_database()