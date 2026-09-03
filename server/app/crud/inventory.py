# server/app/crud/inventory.py - Unified Inventory 지원
import os
import uuid
from PIL import Image
from fastapi import UploadFile
import tempfile
import pandas as pd
from io import BytesIO
import stat  # 추가: 권한 체크용
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, extract, text, case, desc, asc
from app.crud.base import CRUDBase
from app.models.unified_inventory import UnifiedInventory, InventoryImage
from app.schemas.unified_inventory import (
    UnifiedInventoryCreate, 
    UnifiedInventoryUpdate, 
    ReceiptHistoryCreate,
    UnifiedInventoryFilter,
    InventoryImageCreate,
    InventoryQuantityUpdate,
    UnifiedInventoryStats
)

class CRUDInventory(CRUDBase[UnifiedInventory, UnifiedInventoryCreate, UnifiedInventoryUpdate]):
    
    def get_by_item_code(self, db: Session, *, item_code: str) -> Optional[UnifiedInventory]:
        """품목 코드로 재고 조회"""
        return db.query(UnifiedInventory).filter(
            UnifiedInventory.item_code == item_code
        ).first()
    
    def get_multi_with_filter(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[UnifiedInventoryFilter] = None,
        sort_options: Optional[Dict[str, str]] = None
    ) -> List[UnifiedInventory]:
        """필터링된 재고 목록 조회"""
        query = db.query(UnifiedInventory)
        
        if filters:
            if filters.is_receipt_only is not None:
                query = query.filter(UnifiedInventory.is_receipt_only == filters.is_receipt_only)
            if filters.is_active is not None:
                query = query.filter(UnifiedInventory.is_active == filters.is_active)

            # 텍스트 검색
            if filters.search:
                search_term = f"%{filters.search}%"
                query = query.filter(
                    or_(
                        UnifiedInventory.item_name.ilike(search_term),
                        UnifiedInventory.item_code.ilike(search_term),
                        UnifiedInventory.brand.ilike(search_term),
                        UnifiedInventory.supplier_name.ilike(search_term),
                        UnifiedInventory.description.ilike(search_term)
                    )
                )
            
            # 카테고리 필터
            if filters.category:
                query = query.filter(UnifiedInventory.category == filters.category)
            
            # 브랜드 필터
            if filters.brand:
                query = query.filter(UnifiedInventory.brand.ilike(f"%{filters.brand}%"))
            
            # 공급업체 필터
            if filters.supplier_name:
                query = query.filter(UnifiedInventory.supplier_name.ilike(f"%{filters.supplier_name}%"))
            
            # 위치 필터
            if filters.location:
                query = query.filter(UnifiedInventory.location.ilike(f"%{filters.location}%"))
            
            # 창고 필터
            if filters.warehouse:
                query = query.filter(UnifiedInventory.warehouse.ilike(f"%{filters.warehouse}%"))
            
            # 재고 상태 필터
            if filters.stock_status:
                if filters.stock_status == "low_stock":
                    query = query.filter(
                        and_(
                            UnifiedInventory.current_quantity > 0,
                            UnifiedInventory.current_quantity <= UnifiedInventory.minimum_stock
                        )
                    )
                elif filters.stock_status == "out_of_stock":
                    query = query.filter(UnifiedInventory.current_quantity == 0)
                elif filters.stock_status == "overstocked":
                    query = query.filter(
                        and_(
                            UnifiedInventory.maximum_stock.isnot(None),
                            UnifiedInventory.current_quantity >= UnifiedInventory.maximum_stock
                        )
                    )
                elif filters.stock_status == "normal":
                    query = query.filter(
                        and_(
                            UnifiedInventory.current_quantity > UnifiedInventory.minimum_stock,
                            or_(
                                UnifiedInventory.maximum_stock.is_(None),
                                UnifiedInventory.current_quantity < UnifiedInventory.maximum_stock
                            )
                        )
                    )
            
            # 소모품 여부 필터
            if filters.is_consumable is not None:
                query = query.filter(UnifiedInventory.is_consumable == filters.is_consumable)
            
            # 승인 필요 여부 필터
            if filters.requires_approval is not None:
                query = query.filter(UnifiedInventory.requires_approval == filters.requires_approval)
            
            # 날짜 범위 필터
            if filters.last_received_from:
                query = query.filter(UnifiedInventory.last_received_date >= filters.last_received_from)
            if filters.last_received_to:
                query = query.filter(UnifiedInventory.last_received_date <= filters.last_received_to)
            
            # 수량 범위 필터
            if filters.min_quantity is not None:
                query = query.filter(UnifiedInventory.current_quantity >= filters.min_quantity)
            if filters.max_quantity is not None:
                query = query.filter(UnifiedInventory.current_quantity <= filters.max_quantity)
            
            # 이미지 보유 여부 필터
            if filters.has_images is not None:
                if filters.has_images:
                    query = query.filter(UnifiedInventory.main_image_url.isnot(None))
                else:
                    query = query.filter(UnifiedInventory.main_image_url.is_(None))
            
            # 태그 필터
            if filters.tags:
                for tag in filters.tags:
                    query = query.filter(UnifiedInventory.tags.contains([tag]))
        
        # 정렬: 품목명 오름차순
        if sort_options:
            sort_by = sort_options.get('sort_by', 'item_code')
            sort_order = sort_options.get('sort_order', 'desc')
            
            print(f"📊 정렬 적용: {sort_by} {sort_order}")
            
            if sort_by == 'item_code':
                try:
                    # PostgreSQL: 정규식으로 마지막 숫자 4자리 추출
                    if sort_order == 'desc':
                        query = query.order_by(
                            desc(text("CAST(SUBSTRING(item_code, '\\d{4}$') AS INTEGER)"))
                        )
                    else:
                        query = query.order_by(
                            asc(text("CAST(SUBSTRING(item_code, '\\d{4}$') AS INTEGER)"))
                        )
                except Exception as e:
                    print(f"⚠️ 정규식 정렬 실패, 기본 정렬 사용: {e}")
                    # 정규식 실패 시 단순 문자열 정렬
                    if sort_order == 'desc':
                        query = query.order_by(desc(UnifiedInventory.item_code))
                    else:
                        query = query.order_by(asc(UnifiedInventory.item_code))
            else:
                # 다른 컬럼들은 일반 정렬 (기존과 동일)
                sort_column_map = {
                    'item_name': UnifiedInventory.item_name,
                    'created_at': UnifiedInventory.created_at,
                    'current_quantity': UnifiedInventory.current_quantity,
                    'last_received_date': UnifiedInventory.last_received_date,
                }
                
                if sort_by in sort_column_map:
                    column = sort_column_map[sort_by]
                    if sort_order == 'desc':
                        query = query.order_by(desc(column))
                    else:
                        query = query.order_by(asc(column))
                else:
                    # 기본 정렬로 fallback
                    query = query.order_by(desc(UnifiedInventory.created_at))
        else:
            # 🔥 기본 정렬
            try:
                # 정규식으로 마지막 4자리 숫자 추출하여 내림차순
                query = query.order_by(
                    desc(text("CAST(SUBSTRING(item_code, '\\d{4}$') AS INTEGER)"))
                )
            except:
                # 실패 시 생성일 기준 내림차순
                query = query.order_by(desc(UnifiedInventory.created_at))
        
        return query.offset(skip).limit(limit).all()
    
    def count_with_filter(
        self,
        db: Session,
        *,
        filters: Optional[UnifiedInventoryFilter] = None
    ) -> int:
        """필터링된 재고 총 개수"""
        query = db.query(func.count(UnifiedInventory.id))
        
        if filters:
            if filters.is_receipt_only is not None:
                query = query.filter(UnifiedInventory.is_receipt_only == filters.is_receipt_only)
            if filters.is_active is not None:
                query = query.filter(UnifiedInventory.is_active == filters.is_active)

            # 동일한 필터 로직 적용
            if filters.search:
                search_term = f"%{filters.search}%"
                query = query.filter(
                    or_(
                        UnifiedInventory.item_name.ilike(search_term),
                        UnifiedInventory.item_code.ilike(search_term),
                        UnifiedInventory.brand.ilike(search_term),
                        UnifiedInventory.supplier_name.ilike(search_term),
                        UnifiedInventory.description.ilike(search_term)
                    )
                )
            
            if filters.category:
                query = query.filter(UnifiedInventory.category == filters.category)
            
            if filters.brand:
                query = query.filter(UnifiedInventory.brand.ilike(f"%{filters.brand}%"))
            
            if filters.supplier_name:
                query = query.filter(UnifiedInventory.supplier_name.ilike(f"%{filters.supplier_name}%"))
            
            if filters.location:
                query = query.filter(UnifiedInventory.location.ilike(f"%{filters.location}%"))
            
            if filters.warehouse:
                query = query.filter(UnifiedInventory.warehouse.ilike(f"%{filters.warehouse}%"))
            
            if filters.stock_status:
                if filters.stock_status == "low_stock":
                    query = query.filter(
                        and_(
                            UnifiedInventory.current_quantity > 0,
                            UnifiedInventory.current_quantity <= UnifiedInventory.minimum_stock
                        )
                    )
                elif filters.stock_status == "out_of_stock":
                    query = query.filter(UnifiedInventory.current_quantity == 0)
                elif filters.stock_status == "overstocked":
                    query = query.filter(
                        and_(
                            UnifiedInventory.maximum_stock.isnot(None),
                            UnifiedInventory.current_quantity >= UnifiedInventory.maximum_stock
                        )
                    )
                elif filters.stock_status == "normal":
                    query = query.filter(
                        and_(
                            UnifiedInventory.current_quantity > UnifiedInventory.minimum_stock,
                            or_(
                                UnifiedInventory.maximum_stock.is_(None),
                                UnifiedInventory.current_quantity < UnifiedInventory.maximum_stock
                            )
                        )
                    )
            
            if filters.is_consumable is not None:
                query = query.filter(UnifiedInventory.is_consumable == filters.is_consumable)
            
            if filters.requires_approval is not None:
                query = query.filter(UnifiedInventory.requires_approval == filters.requires_approval)
            
            if filters.last_received_from:
                query = query.filter(UnifiedInventory.last_received_date >= filters.last_received_from)
            if filters.last_received_to:
                query = query.filter(UnifiedInventory.last_received_date <= filters.last_received_to)
            
            if filters.min_quantity is not None:
                query = query.filter(UnifiedInventory.current_quantity >= filters.min_quantity)
            if filters.max_quantity is not None:
                query = query.filter(UnifiedInventory.current_quantity <= filters.max_quantity)
            
            if filters.has_images is not None:
                if filters.has_images:
                    query = query.filter(UnifiedInventory.main_image_url.isnot(None))
                else:
                    query = query.filter(UnifiedInventory.main_image_url.is_(None))
            
            if filters.tags:
                for tag in filters.tags:
                    query = query.filter(UnifiedInventory.tags.contains([tag]))
        
        return query.scalar()
    
    def get_low_stock_items(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[UnifiedInventory]:
        """재고 부족 품목 조회"""
        return (
            db.query(UnifiedInventory)
            .filter(UnifiedInventory.current_quantity <= UnifiedInventory.minimum_stock)
            .filter(UnifiedInventory.is_active == True)
            .order_by(UnifiedInventory.current_quantity)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_out_of_stock_items(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[UnifiedInventory]:
        """재고 없는 품목 조회"""
        return (
            db.query(UnifiedInventory)
            .filter(UnifiedInventory.current_quantity == 0)
            .filter(UnifiedInventory.is_active == True)
            .order_by(UnifiedInventory.last_received_date.desc().nullslast())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_categories(self, db: Session) -> List[str]:
        """모든 카테고리 목록 조회"""
        result = db.query(UnifiedInventory.category).distinct().filter(
            and_(
                UnifiedInventory.category.isnot(None),
                UnifiedInventory.is_active == True
            )
        ).all()
        return [category[0] for category in result if category[0]]
    
    def get_brands(self, db: Session) -> List[str]:
        """모든 브랜드 목록 조회"""
        result = db.query(UnifiedInventory.brand).distinct().filter(
            and_(
                UnifiedInventory.brand.isnot(None),
                UnifiedInventory.is_active == True
            )
        ).all()
        return [brand[0] for brand in result if brand[0]]
    
    def get_suppliers(self, db: Session) -> List[str]:
        """모든 공급업체 목록 조회"""
        result = db.query(UnifiedInventory.supplier_name).distinct().filter(
            and_(
                UnifiedInventory.supplier_name.isnot(None),
                UnifiedInventory.is_active == True
            )
        ).all()
        return [supplier[0] for supplier in result if supplier[0]]
    
    def get_locations(self, db: Session) -> List[str]:
        """모든 위치 목록 조회"""
        result = db.query(UnifiedInventory.location).distinct().filter(
            and_(
                UnifiedInventory.location.isnot(None),
                UnifiedInventory.is_active == True
            )
        ).all()
        return [location[0] for location in result if location[0]]
    
    def get_warehouses(self, db: Session) -> List[str]:
        """모든 창고 목록 조회"""
        result = db.query(UnifiedInventory.warehouse).distinct().filter(
            and_(
                UnifiedInventory.warehouse.isnot(None),
                UnifiedInventory.is_active == True
            )
        ).all()
        return [warehouse[0] for warehouse in result if warehouse[0]]
    
    def get_all_tags(self, db: Session) -> List[str]:
        """모든 태그 목록 조회"""
        # JSON 배열에서 태그 추출 (PostgreSQL의 경우)
        try:
            result = db.execute(
                text("SELECT DISTINCT jsonb_array_elements_text(tags) as tag FROM unified_inventory WHERE is_active = true AND tags IS NOT NULL")
            ).fetchall()
            return [row[0] for row in result if row[0]]
        except:
            # 다른 DB의 경우 또는 오류 시 빈 리스트 반환
            return []
    
    def update_stock(self, db: Session, *, item_id: int, quantity: int) -> Optional[UnifiedInventory]:
        """재고 수량 업데이트"""
        db_obj = self.get(db, id=item_id)
        if db_obj:
            previous_quantity = db_obj.current_quantity
            db_obj.current_quantity = max(0, db_obj.current_quantity + quantity)
            db_obj.quantity_history = [
                *(db_obj.quantity_history or []),
                {
                    "type": "outbound" if quantity < 0 else "adjustment",
                    "quantity_change": quantity,
                    "previous_quantity": previous_quantity,
                    "result_quantity": db_obj.current_quantity,
                    "user_name": "시스템",
                    "department": "-",
                    "created_at": datetime.now().isoformat(),
                },
            ]
            db_obj.updated_at = datetime.now()
            db.commit()
            db.refresh(db_obj)
        return db_obj
    
    def add_receipt(self, db: Session, *, item_id: int, receipt_in: ReceiptHistoryCreate) -> Optional[UnifiedInventory]:
        """수령 이력 추가"""
        inventory = self.get(db=db, id=item_id)
        if not inventory:
            return None
        
        # 수령 번호 생성 (현재 시간 기반)
        receipt_number = f"RC{datetime.now().strftime('%Y%m%d')}{item_id:04d}{len(inventory.receipt_history or []) + 1:03d}"
        
        receipt_data = receipt_in.dict()
        receipt_data['receipt_number'] = receipt_number
        
        # 수령 이력 추가
        if inventory.receipt_history is None:
            inventory.receipt_history = []
        inventory.receipt_history.append(receipt_data)
        
        # 수량 업데이트
        inventory.total_received += receipt_in.received_quantity
        inventory.current_quantity += receipt_in.received_quantity
        
        # 최근 수령 정보 업데이트
        inventory.last_received_date = receipt_in.received_date
        inventory.last_received_by = receipt_in.receiver_name
        inventory.last_received_department = receipt_in.department
        
        # 상태별 수량 업데이트
        condition = receipt_in.condition or "good"
        if inventory.condition_quantities is None:
            inventory.condition_quantities = {"excellent": 0, "good": 0, "damaged": 0, "defective": 0}
        
        inventory.condition_quantities[condition] = inventory.condition_quantities.get(condition, 0) + receipt_in.received_quantity
        
        # 총 가치 업데이트
        if inventory.unit_price:
            inventory.total_value = inventory.current_quantity * inventory.unit_price
        
        inventory.updated_at = datetime.now()
        
        db.add(inventory)
        db.commit()
        db.refresh(inventory)
        return inventory
    
    def update_quantity(
        self, 
        db: Session, 
        *, 
        item_id: int, 
        quantity_change: int,
        user_name: str,
        department: str,
        purpose: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Optional[UnifiedInventory]:
        """사용 이력 없이 간단한 수량 업데이트"""
        inventory = self.get(db=db, id=item_id)
        if not inventory:
            return None
        
        # 수량 변경
        previous_quantity = inventory.current_quantity
        new_quantity = max(0, inventory.current_quantity + quantity_change)
        inventory.current_quantity = new_quantity
        inventory.quantity_history = [
            *(inventory.quantity_history or []),
            {
                "type": "outbound" if quantity_change < 0 else "adjustment",
                "quantity_change": quantity_change,
                "previous_quantity": previous_quantity,
                "result_quantity": new_quantity,
                "user_name": user_name,
                "department": department,
                "purpose": purpose,
                "notes": notes,
                "created_at": datetime.now().isoformat(),
            },
        ]
        
        # 소모품인 경우 예약 수량 업데이트
        if inventory.is_consumable and quantity_change < 0:
            inventory.reserved_quantity = max(0, inventory.reserved_quantity + quantity_change)
        
        # 최근 사용일 업데이트
        if quantity_change < 0:  # 출고인 경우
            inventory.last_used_date = datetime.now()
        
        # 총 가치 업데이트
        if inventory.unit_price:
            inventory.total_value = inventory.current_quantity * inventory.unit_price
        
        inventory.updated_at = datetime.now()
        
        db.add(inventory)
        db.commit()
        db.refresh(inventory)
        return inventory
    
    def get_inventory_stats(self, db: Session) -> UnifiedInventoryStats:
        """재고 통계 조회 - LOG 관련 제거"""
        # 기본 통계
        total_items = db.query(func.count(UnifiedInventory.id)).filter(
            UnifiedInventory.is_active == True,
            UnifiedInventory.is_receipt_only == False
        ).scalar() or 0
        
        low_stock_items = db.query(func.count(UnifiedInventory.id)).filter(
            and_(
                UnifiedInventory.current_quantity <= UnifiedInventory.minimum_stock,
                UnifiedInventory.is_active == True,
                UnifiedInventory.is_receipt_only == False
            )
        ).scalar() or 0
        
        out_of_stock_items = db.query(func.count(UnifiedInventory.id)).filter(
            and_(
                UnifiedInventory.current_quantity == 0,
                UnifiedInventory.is_active == True,
                UnifiedInventory.is_receipt_only == False
            )
        ).scalar() or 0
        
        overstocked_items = db.query(func.count(UnifiedInventory.id)).filter(
            and_(
                UnifiedInventory.maximum_stock.isnot(None),
                UnifiedInventory.current_quantity >= UnifiedInventory.maximum_stock,
                UnifiedInventory.is_active == True,
                UnifiedInventory.is_receipt_only == False
            )
        ).scalar() or 0
        
        # 총 가치 계산
        total_value = db.query(
            func.sum(UnifiedInventory.current_quantity * UnifiedInventory.unit_price)
        ).filter(
            and_(
                UnifiedInventory.is_active == True,
                UnifiedInventory.is_receipt_only == False,
                UnifiedInventory.unit_price.isnot(None)
            )
        ).scalar() or 0
        
        # 카테고리별 통계
        category_stats = db.query(
            UnifiedInventory.category,
            func.count(UnifiedInventory.id).label('count')
        ).filter(
            and_(
                UnifiedInventory.is_active == True,
                UnifiedInventory.is_receipt_only == False,
                UnifiedInventory.category.isnot(None)
            )
        ).group_by(UnifiedInventory.category).all()
        
        total_categorized = sum(stat.count for stat in category_stats)
        category_distribution = [
            {
                "category": stat.category,
                "count": stat.count,
                "percentage": round((stat.count / total_categorized * 100), 2) if total_categorized > 0 else 0
            }
            for stat in category_stats
        ]
        
        # 최근 수령 통계
        recent_date = datetime.now() - timedelta(days=7)
        recent_receipts = db.query(func.count(UnifiedInventory.id)).filter(
            and_(
                UnifiedInventory.last_received_date >= recent_date,
                UnifiedInventory.is_active == True,
                UnifiedInventory.is_receipt_only == False
            )
        ).scalar() or 0
        
        # whens를 별도 튜플로 정의 (리스트 아님)
        whens = (
            (UnifiedInventory.total_received > 0, (UnifiedInventory.total_received - UnifiedInventory.current_quantity) * 100.0 / UnifiedInventory.total_received),
            # 추가 조건이 있으면 여기에 (condition, value) 튜플 추가
        )

        # case() 호출: positional 먼저, keyword 나중에
        avg_utilization = db.query(
            func.avg(
                case(*whens, else_=0)  # else_를 0으로 직접 설정 (default_value 대신)
            )
        ).filter(
            UnifiedInventory.is_active == True,
            UnifiedInventory.is_receipt_only == False
        ).scalar() or 0
        
        return UnifiedInventoryStats(
            total_items=total_items,
            total_categories=len(category_distribution),
            low_stock_items=low_stock_items,
            out_of_stock_items=out_of_stock_items,
            overstocked_items=overstocked_items,
            total_value=float(total_value),
            average_utilization=round(float(avg_utilization), 2),
            status_distribution={
                "normal": total_items - low_stock_items - out_of_stock_items - overstocked_items,
                "low_stock": low_stock_items,
                "out_of_stock": out_of_stock_items,
                "overstocked": overstocked_items
            },
            category_distribution=category_distribution,
            recent_receipts=recent_receipts
        )

    

    
    def upload_image(self, db: Session, *, file, image_data: InventoryImageCreate) -> InventoryImage:
        upload_dir = "/app/uploads/inventory_images"  # 절대 경로 사용
        try:
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir, exist_ok=True)
                os.chmod(upload_dir, stat.S_IRWXU | stat.S_IRWXG | stat.S_IROTH)  # 권한 설정 (775)
            # 나머지 로직 (파일 저장 등)
        except PermissionError as e:
            raise ValueError(f"권한 오류: {str(e)}")  # 400 반환으로 변경
        """이미지 업로드 - 파일 없음 처리 추가"""
        if not file or not file.filename:
            raise ValueError("이미지 파일이 필요합니다.")  # 400 반환으로 변경
        
        # 파일 검증
        if not file.content_type.startswith('image/'):
            raise ValueError("이미지 파일만 업로드 가능합니다.")
        
        if file.size > 10 * 1024 * 1024:  # 10MB 제한
            raise ValueError("파일 크기는 10MB를 초과할 수 없습니다.")
        
        # 파일 저장 경로 설정
        upload_dir = os.path.abspath("uploads/inventory_images")  # os 사용 예시
        os.makedirs(upload_dir, exist_ok=True)  # 디렉토리 생성 (os 사용)
            
        # 고유 파일명 생성
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # 파일 저장
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        # 썸네일 생성 (에러 핸들링 강화)
        thumbnail_path = None
        try:
            with Image.open(file_path) as img:
                img.thumbnail((200, 200), Image.Resampling.LANCZOS)
                thumbnail_filename = f"thumb_{unique_filename}"
                thumbnail_path = os.path.join(upload_dir, thumbnail_filename)
                img.save(thumbnail_path)
        except Exception as e:
            print(f"썸네일 생성 실패: {e}")  # 로그만, 실패해도 진행
        
        # 이미지 정보 저장
        image_obj = InventoryImage(
            unified_inventory_id=image_data.unified_inventory_id,
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file.size,
            mime_type=file.content_type,
            image_type=image_data.image_type,
            description=image_data.description,
            thumbnail_path=thumbnail_path,
            is_active=True,
            uploaded_at=datetime.now()
        )
        
        db.add(image_obj)
        
        # 메인 이미지 설정 (첫 번째 이미지인 경우)
        inventory = self.get(db=db, id=image_data.unified_inventory_id)
        if inventory and not inventory.main_image_url:
            inventory.main_image_url = file_path
            inventory.image_urls = [file_path]
        elif inventory:
            if inventory.image_urls is None:
                inventory.image_urls = []
            inventory.image_urls.append(file_path)
        
        db.commit()
        db.refresh(image_obj)
        return image_obj
    
    
    def delete_image(self, db: Session, *, image_id: int, item_id: int) -> bool:
        """이미지 삭제"""
        image = db.query(InventoryImage).filter(
            and_(
                InventoryImage.id == image_id,
                InventoryImage.unified_inventory_id == item_id
            )
        ).first()
        
        if not image:
            return False
        
        # 파일 삭제
        try:
            if os.path.exists(image.file_path):
                os.remove(image.file_path)
            if image.thumbnail_path and os.path.exists(image.thumbnail_path):
                os.remove(image.thumbnail_path)
        except Exception as e:
            print(f"파일 삭제 실패: {e}")
        
        # DB에서 삭제
        db.delete(image)
        
        # 품목의 이미지 URL 업데이트
        inventory = self.get(db=db, id=item_id)
        if inventory:
            if inventory.main_image_url == image.file_path:
                # 메인 이미지였다면 다른 이미지로 교체
                remaining_images = db.query(InventoryImage).filter(
                    and_(
                        InventoryImage.unified_inventory_id == item_id,
                        InventoryImage.id != image_id
                    )
                ).first()
                inventory.main_image_url = remaining_images.file_path if remaining_images else None
            
            if inventory.image_urls and image.file_path in inventory.image_urls:
                inventory.image_urls.remove(image.file_path)
        
        db.commit()
        return True
    
    def get_dashboard_data(self, db: Session) -> Dict[str, Any]:
        """대시보드 데이터 조회 - LOG 관련 제거"""
        stats = self.get_inventory_stats(db)
        
        # 월별 수령 현황 (최근 12개월)
        monthly_receipts = []
        for i in range(12):
            month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            count = db.query(func.count(UnifiedInventory.id)).filter(
                and_(
                    UnifiedInventory.last_received_date >= month_start,
                    UnifiedInventory.last_received_date <= month_end,
                    UnifiedInventory.is_active == True
                )
            ).scalar() or 0
            
            monthly_receipts.append({
                "month": month_start.strftime("%Y-%m"),
                "count": count
            })
        
        # 알림 생성
        alerts = []
        
        # 재고 부족 알림
        if stats.low_stock_items > 0:
            alerts.append({
                "type": "warning",
                "message": f"{stats.low_stock_items}개 품목의 재고가 부족합니다.",
                "priority": "high"
            })
        
        # 재고 없음 알림
        if stats.out_of_stock_items > 0:
            alerts.append({
                "type": "error",
                "message": f"{stats.out_of_stock_items}개 품목의 재고가 없습니다.",
                "priority": "critical"
            })
        
        # 추천사항
        recommendations = []
        if stats.low_stock_items > 0:
            recommendations.append("재고 부족 품목에 대한 주문을 검토하세요.")
        if stats.overstocked_items > 0:
            recommendations.append("과잉 재고 품목의 사용을 촉진하세요.")
        if stats.average_utilization < 50:
            recommendations.append("재고 회전율을 개선하기 위한 정책을 검토하세요.")
        
        return {
            "total_items": stats.total_items,
            "total_value": stats.total_value,
            "low_stock_alerts": stats.low_stock_items,
            "recent_receipts": stats.recent_receipts,
            "category_chart": stats.category_distribution,
            "stock_status_chart": [
                {"status": "정상", "count": stats.status_distribution["normal"]},
                {"status": "부족", "count": stats.status_distribution["low_stock"]},
                {"status": "없음", "count": stats.status_distribution["out_of_stock"]},
                {"status": "과잉", "count": stats.status_distribution["overstocked"]}
            ],
            "monthly_receipts": monthly_receipts,
            "alerts": alerts,
            "recommendations": recommendations
        }

    def get_alerts(self, db: Session, *, alert_type: Optional[str] = None, priority: Optional[str] = None) -> List[Dict[str, Any]]:
        """재고 관련 알림 조회 - LOG 관련 제거"""
        alerts = []
        
        # 재고 부족 알림
        low_stock_items = self.get_low_stock_items(db, limit=50)
        for item in low_stock_items:
            if not alert_type or alert_type == "low_stock":
                alerts.append({
                    "type": "low_stock",
                    "priority": "high" if item.current_quantity == 0 else "medium",
                    "message": f"{item.item_name} - 재고 부족 (현재: {item.current_quantity}, 최소: {item.minimum_stock})",
                    "item_id": item.id,
                    "created_at": datetime.now().isoformat()
                })
        
        # 만료 예정 알림 (수령일로부터 1년 경과)
        old_items = db.query(UnifiedInventory).filter(
            and_(
                UnifiedInventory.last_received_date < datetime.now() - timedelta(days=365),
                UnifiedInventory.is_active == True,
                UnifiedInventory.current_quantity > 0
            )
        ).limit(20).all()
        
        for item in old_items:
            if not alert_type or alert_type == "expiry":
                alerts.append({
                    "type": "expiry",
                    "priority": "low",
                    "message": f"{item.item_name} - 오래된 재고 확인 필요 (마지막 수령: {item.last_received_date.strftime('%Y-%m-%d') if item.last_received_date else '미상'})",
                    "item_id": item.id,
                    "created_at": datetime.now().isoformat()
                })
        
        # 우선순위 필터링
        if priority:
            alerts = [alert for alert in alerts if alert["priority"] == priority]
        
        return sorted(alerts, key=lambda x: {"critical": 4, "high": 3, "medium": 2, "low": 1}[x["priority"]], reverse=True)
        
    def get_recommendations(self, db: Session) -> List[str]:
        """재고 관리 추천사항"""
        recommendations = []
        stats = self.get_inventory_stats(db)
        
        if stats.low_stock_items > 0:
            recommendations.append(f"{stats.low_stock_items}개 품목의 재고가 부족합니다. 주문을 검토하세요.")
        
        if stats.out_of_stock_items > 0:
            recommendations.append(f"{stats.out_of_stock_items}개 품목의 재고가 없습니다. 긴급 주문이 필요합니다.")
        
        if stats.overstocked_items > 0:
            recommendations.append(f"{stats.overstocked_items}개 품목이 과잉 재고 상태입니다. 사용을 촉진하거나 재고 한도를 조정하세요.")
        
        if stats.average_utilization < 30:
            recommendations.append("전체 재고 사용률이 낮습니다. 불필요한 재고를 정리하고 주문 정책을 검토하세요.")
        
        if stats.total_items == 0:
            recommendations.append("등록된 품목이 없습니다. 품목을 등록하여 재고 관리를 시작하세요.")
        
        return recommendations

    def transfer_item(
        self, 
        db: Session, 
        *, 
        item_id: int, 
        transfer_data
    ) -> UnifiedInventory:
        """품목 이동/전송 - 로그 없이 단순화"""
        inventory = self.get(db=db, id=item_id)
        if not inventory:
            raise ValueError("품목을 찾을 수 없습니다.")
        
        # 재고 수량 업데이트 (로그 없이 간단하게)
        inventory.current_quantity -= transfer_data.quantity
        inventory.location = transfer_data.to_location
        inventory.updated_at = datetime.now()
        
        db.add(inventory)
        db.commit()
        db.refresh(inventory)
        
        return inventory
    
    def bulk_create_from_excel(
        self, 
        db: Session, 
        file: UploadFile
    ) -> Dict[str, Any]:
        """Excel 파일에서 품목 일괄 생성/업데이트"""
        try:
            # 파일 내용 읽기
            content = file.file.read()
            df = pd.read_excel(BytesIO(content))
            
            created_items = []
            updated_items = []
            errors = []
            
            for index, row in df.iterrows():
                try:
                    # 필수 필드 검증
                    item_code = str(row['품목코드']).strip()
                    item_name = str(row['품목명']).strip()
                    
                    if not item_code or item_code == 'nan':
                        errors.append({
                            "row": index + 2,
                            "field": "품목코드",
                            "message": "품목코드는 필수입니다"
                        })
                        continue
                    
                    # 기존 품목 확인
                    existing_item = self.get_by_item_code(db=db, item_code=item_code)
                    
                    # 품목 데이터 구성
                    inventory_data = self._parse_excel_row(row)
                    
                    if existing_item:
                        # 업데이트
                        updated_item = self.update(db=db, db_obj=existing_item, obj_in=inventory_data)
                        updated_items.append(item_code)
                    else:
                        # 생성
                        new_item = self.create(db=db, obj_in=inventory_data)
                        created_items.append(item_code)
                        
                except Exception as e:
                    errors.append({
                        "row": index + 2,
                        "field": "전체",
                        "message": str(e)
                    })
            
            return {
                "created_count": len(created_items),
                "updated_count": len(updated_items),
                "created_items": created_items,
                "updated_items": updated_items,
                "errors": errors,
                "total_processed": len(created_items) + len(updated_items)
            }
            
        except Exception as e:
            raise Exception(f"Excel 파일 처리 중 오류: {str(e)}")
    
    def _parse_excel_row(self, row: pd.Series) -> Dict[str, Any]:
        """Excel 행 데이터를 품목 데이터로 변환"""
        return {
            "item_code": str(row['품목코드']).strip(),
            "item_name": str(row['품목명']).strip(),
            "category": str(row.get('카테고리', '')).strip() if pd.notna(row.get('카테고리')) else None,
            "brand": str(row.get('브랜드', '')).strip() if pd.notna(row.get('브랜드')) else None,
            "specifications": str(row.get('사양', '')).strip() if pd.notna(row.get('사양')) else None,
            "unit": str(row.get('단위', '개')).strip() if pd.notna(row.get('단위')) else '개',
            "unit_price": float(row['단가']) if pd.notna(row.get('단가')) and row['단가'] != '' else None,
            "currency": str(row.get('통화', 'KRW')).strip() if pd.notna(row.get('통화')) else 'KRW',
            "location": str(row.get('위치', '')).strip() if pd.notna(row.get('위치')) else None,
            "warehouse": str(row.get('창고', '')).strip() if pd.notna(row.get('창고')) else None,
            "supplier_name": str(row.get('공급업체', '')).strip() if pd.notna(row.get('공급업체')) else None,
            "minimum_stock": int(row.get('최소재고', 0)) if pd.notna(row.get('최소재고')) else 0,
            "maximum_stock": int(row['최대재고']) if pd.notna(row.get('최대재고')) and row['최대재고'] != '' else None,
            "description": str(row.get('설명', '')).strip() if pd.notna(row.get('설명')) else None,
            "notes": str(row.get('비고', '')).strip() if pd.notna(row.get('비고')) else None,
            "is_consumable": self._parse_boolean(row.get('소모품여부', False)),
            "requires_approval": self._parse_boolean(row.get('승인필요', False)),
            "tags": [tag.strip() for tag in str(row.get('태그', '')).split(',') if tag.strip()] if pd.notna(row.get('태그')) else [],
            "is_active": True,
            "created_by": "Excel업로드"
        }
    
    def _parse_boolean(self, value: Any) -> bool:
        """다양한 형태의 불린값을 파싱"""
        if pd.isna(value):
            return False
        
        if isinstance(value, bool):
            return value
        
        if isinstance(value, (int, float)):
            return bool(value)
        
        if isinstance(value, str):
            value = value.lower().strip()
            return value in ['true', '참', 'yes', 'y', '1', 'on', 'enabled']
        
        return False
    
    def export_to_excel(
        self, 
        db: Session, 
        filters: UnifiedInventoryFilter = None,
        include_receipts: bool = False,
        include_images: bool = False
    ) -> BytesIO:
        """품목 데이터를 Excel로 내보내기"""
        try:
            # 데이터 조회
            items = self.get_multi_with_filter(db=db, skip=0, limit=10000, filters=filters or UnifiedInventoryFilter())
            
            # 메인 데이터 준비
            main_data = []
            for item in items:
                row = {
                    '품목코드': item.item_code,
                    '품목명': item.item_name,
                    '카테고리': item.category or '',
                    '브랜드': item.brand or '',
                    '사양': item.specifications or '',
                    '단위': item.unit,
                    '단가': item.unit_price or 0,
                    '통화': item.currency,
                    '총수령수량': item.total_received,
                    '현재수량': item.current_quantity,
                    '예약수량': item.reserved_quantity,
                    '사용가능수량': item.available_quantity,
                    '최소재고': item.minimum_stock,
                    '최대재고': item.maximum_stock or '',
                    '위치': item.location or '',
                    '창고': item.warehouse or '',
                    '공급업체': item.supplier_name or '',
                    '재고상태': item.stock_status,
                    '소모품여부': item.is_consumable,
                    '승인필요': item.requires_approval,
                    '활성상태': item.is_active,
                    '설명': item.description or '',
                    '비고': item.notes or '',
                    '태그': ', '.join(item.tags) if item.tags else '',
                    '생성일': item.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    '생성자': item.created_by or ''
                }
                
                if include_images:
                    row['메인이미지'] = item.main_image_url or ''
                    row['추가이미지수'] = len(item.image_urls) if item.image_urls else 0
                
                main_data.append(row)
            
            # Excel 파일 생성
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                # 메인 데이터 시트
                main_df = pd.DataFrame(main_data)
                main_df.to_excel(writer, sheet_name='품목목록', index=False)
                
                # 수령 이력 시트 (선택사항)
                if include_receipts:
                    receipt_data = []
                    for item in items:
                        if item.receipt_history:
                            for receipt in item.receipt_history:
                                receipt_row = {
                                    '품목코드': item.item_code,
                                    '품목명': item.item_name,
                                    '수령번호': receipt.get('receipt_number', ''),
                                    '수령수량': receipt.get('received_quantity', 0),
                                    '수령자': receipt.get('receiver_name', ''),
                                    '부서': receipt.get('department', ''),
                                    '수령일': receipt.get('received_date', ''),
                                    '상태': receipt.get('condition', ''),
                                    '비고': receipt.get('notes', '')
                                }
                                receipt_data.append(receipt_row)
                    
                    if receipt_data:
                        receipt_df = pd.DataFrame(receipt_data)
                        receipt_df.to_excel(writer, sheet_name='수령이력', index=False)
                
                # 통계 시트
                stats_data = {
                    '구분': [
                        '전체 품목 수',
                        '활성 품목 수',
                        '재고 부족 품목',
                        '재고 없는 품목',
                        '소모품 수',
                        '승인 필요 품목'
                    ],
                    '값': [
                        len(items),
                        len([item for item in items if item.is_active]),
                        len([item for item in items if item.is_low_stock]),
                        len([item for item in items if item.current_quantity == 0]),
                        len([item for item in items if item.is_consumable]),
                        len([item for item in items if item.requires_approval])
                    ]
                }
                
                stats_df = pd.DataFrame(stats_data)
                stats_df.to_excel(writer, sheet_name='통계', index=False)
            
            output.seek(0)
            return output
            
        except Exception as e:
            raise Exception(f"Excel 내보내기 중 오류: {str(e)}")
    
    def generate_template(self) -> BytesIO:
        """품목 등록용 Excel 템플릿 생성"""
        try:
            # 샘플 데이터
            template_data = {
                '품목코드': ['ITM-001', 'ITM-002', 'ITM-003'],
                '품목명': ['노트북', '사무용 의자', '프린터 토너'],
                '카테고리': ['IT장비', '사무용품', '소모품'],
                '브랜드': ['삼성', '허먼밀러', 'HP'],
                '사양': [
                    '14인치, 8GB RAM, 256GB SSD',
                    '인체공학적 디자인, 높이조절',
                    'LaserJet 호환 검정 토너'
                ],
                '단위': ['대', '개', '개'],
                '단가': [1200000, 450000, 35000],
                '통화': ['KRW', 'KRW', 'KRW'],
                '위치': ['IT실', '사무실', '창고'],
                '창고': ['본사창고', '본사창고', '소모품창고'],
                '공급업체': ['테크월드', '오피스퍼니처', '프린터월드'],
                '최소재고': [2, 5, 10],
                '최대재고': [10, 20, 50],
                '소모품여부': [False, False, True],
                '승인필요': [True, False, False],
                '설명': [
                    '업무용 고성능 노트북',
                    '장시간 업무에 적합한 의자',
                    '프린터 교체용 토너'
                ],
                '비고': [
                    '보증기간 3년',
                    '5년 AS 보장',
                    '정품만 구매'
                ],
                '태그': ['전자제품,업무용', '가구,사무용품', '소모품,프린터']
            }
            
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df = pd.DataFrame(template_data)
                df.to_excel(writer, sheet_name='품목목록', index=False)
                
                # 안내사항 시트
                instructions = pd.DataFrame({
                    '항목': [
                        '템플릿 사용법',
                        '필수 컬럼',
                        '선택 컬럼',
                        '데이터 형식',
                        '주의사항'
                    ],
                    '설명': [
                        '이 템플릿을 다운로드하여 품목 정보를 입력한 후 업로드하세요',
                        '품목코드, 품목명, 단위, 최소재고는 반드시 입력해야 합니다',
                        '나머지 컬럼들은 선택사항이며, 빈 값으로 두면 기본값이 적용됩니다',
                        '숫자는 숫자 형식으로, 텍스트는 텍스트 형식으로 입력하세요',
                        '품목코드는 고유해야 하며, 중복 시 기존 품목이 업데이트됩니다'
                    ]
                })
                
                instructions.to_excel(writer, sheet_name='사용안내', index=False)
            
            output.seek(0)
            return output
            
        except Exception as e:
            raise Exception(f"템플릿 생성 중 오류: {str(e)}")
        
    def upload_transaction_document(
        self, 
        db: Session, 
        *, 
        item_id: int, 
        file: UploadFile,
        uploaded_by: str = "시스템"
    ) -> Optional[UnifiedInventory]:
        """거래명세서 업로드"""
        inventory = self.get(db=db, id=item_id)
        if not inventory:
            return None
        
        # 파일 저장 로직 (기존 이미지 업로드와 동일)
        upload_dir = os.path.join(os.getcwd(), "uploads", "transaction_documents")
        os.makedirs(upload_dir, exist_ok=True)
        
        # 고유 파일명 생성
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"transaction_{item_id}_{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # 파일 저장
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        # URL 생성
        # file_url = f"http://211.44.183.165:8000/uploads/transaction_documents/{unique_filename}"
        # file_url = f"http://211.197.16.248:8000/uploads/transaction_documents/{unique_filename}"
        
        file_url = f"http://211.197.16.248:8000/uploads/transaction_documents/{unique_filename}"
        # file_url = f"http://localhost:8000/uploads/transaction_documents/{unique_filename}"
        

        # 🔥 새로운 컬럼들 업데이트
        inventory.transaction_document_url = file_url
        inventory.transaction_upload_date = datetime.now()
        inventory.transaction_uploaded_by = uploaded_by
        
        db.commit()
        db.refresh(inventory)
        return inventory
    
# 인스턴스 생성
inventory = CRUDInventory(UnifiedInventory)
