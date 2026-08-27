import pandas as pd
from io import BytesIO
from typing import List, Dict, Any
from fastapi import HTTPException

class ExcelService:
    """Excel 파일 처리 서비스"""
    
    # Excel 컬럼 매핑 (한글 -> 영어)
    COLUMN_MAPPING = {
        "품목코드": "item_code",
        "품목명": "item_name", 
        "카테고리": "category",
        "브랜드": "brand",
        "현재재고": "current_stock",
        "최소재고": "minimum_stock",
        "최대재고": "maximum_stock",
        "단가": "unit_price",
        "통화": "currency",
        "공급업체명": "supplier_name",
        "공급업체연락처": "supplier_contact",
        "위치": "location",
        "창고": "warehouse",
        "설명": "description",
        "활성상태": "is_active"
    }
    
    def parse_inventory_excel(self, file_content: bytes) -> List[Dict[str, Any]]:
        """
        Excel 파일에서 재고 데이터를 파싱
        
        Args:
            file_content: Excel 파일의 바이트 데이터
            
        Returns:
            재고 데이터 리스트
        """
        try:
            # Excel 파일 읽기
            df = pd.read_excel(BytesIO(file_content), engine='openpyxl')
            
            # 빈 행 제거
            df = df.dropna(how='all')
            
            if df.empty:
                raise HTTPException(status_code=400, detail="Excel 파일에 데이터가 없습니다.")
            
            # 컬럼명 매핑
            df = df.rename(columns=self.COLUMN_MAPPING)
            
            # 필수 컬럼 확인
            required_columns = ['item_code', 'item_name']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise HTTPException(
                    status_code=400, 
                    detail=f"필수 컬럼이 없습니다: {missing_columns}"
                )
            
            # 데이터 변환 및 검증
            inventory_data = []
            for index, row in df.iterrows():
                try:
                    item_data = self._process_row(row)
                    inventory_data.append(item_data)
                except Exception as e:
                    raise HTTPException(
                        status_code=400,
                        detail=f"행 {index + 2}에서 오류: {str(e)}"
                    )
            
            return inventory_data
            
        except pd.errors.EmptyDataError:
            raise HTTPException(status_code=400, detail="Excel 파일이 비어있습니다.")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Excel 파일 처리 오류: {str(e)}")
    
    def _process_row(self, row: pd.Series) -> Dict[str, Any]:
        """
        Excel 행 데이터를 처리하여 재고 데이터로 변환
        
        Args:
            row: pandas Series 객체
            
        Returns:
            처리된 재고 데이터
        """
        item_data = {}
        
        # 필수 필드
        item_data['item_code'] = str(row.get('item_code', '')).strip()
        item_data['item_name'] = str(row.get('item_name', '')).strip()
        
        if not item_data['item_code']:
            raise ValueError("품목코드는 필수입니다.")
        if not item_data['item_name']:
            raise ValueError("품목명은 필수입니다.")
        
        # 선택적 필드
        if pd.notna(row.get('category')):
            item_data['category'] = str(row['category']).strip()
        
        if pd.notna(row.get('brand')):
            item_data['brand'] = str(row['brand']).strip()
        
        # 숫자 필드
        numeric_fields = ['current_stock', 'minimum_stock', 'maximum_stock', 'unit_price']
        for field in numeric_fields:
            if pd.notna(row.get(field)):
                try:
                    value = float(row[field])
                    if field in ['current_stock', 'minimum_stock', 'maximum_stock']:
                        item_data[field] = int(value)
                    else:
                        item_data[field] = value
                except (ValueError, TypeError):
                    raise ValueError(f"{field} 값이 올바르지 않습니다: {row.get(field)}")
        
        # 문자열 필드
        string_fields = ['currency', 'supplier_name', 'supplier_contact', 'location', 'warehouse', 'description']
        for field in string_fields:
            if pd.notna(row.get(field)):
                item_data[field] = str(row[field]).strip()
        
        # 불린 필드
        if pd.notna(row.get('is_active')):
            value = row['is_active']
            if isinstance(value, bool):
                item_data['is_active'] = value
            elif isinstance(value, str):
                item_data['is_active'] = value.lower() in ['true', '1', 'yes', 'y', '활성', '사용']
            else:
                item_data['is_active'] = bool(value)
        
        return item_data
    
    def generate_template(self) -> pd.DataFrame:
        """
        Excel 업로드 템플릿 생성
        
        Returns:
            템플릿 DataFrame
        """
        # 한글 컬럼명으로 템플릿 생성
        korean_columns = list(self.COLUMN_MAPPING.keys())
        
        # 샘플 데이터
        sample_data = {
            "품목코드": ["ITEM001", "ITEM002"],
            "품목명": ["샘플 품목 1", "샘플 품목 2"],
            "카테고리": ["전자제품", "사무용품"],
            "브랜드": ["삼성", "LG"],
            "현재재고": [100, 50],
            "최소재고": [10, 5],
            "최대재고": [500, 200],
            "단가": [25000, 15000],
            "통화": ["KRW", "KRW"],
            "공급업체명": ["ABC 공급업체", "XYZ 공급업체"],
            "공급업체연락처": ["02-1234-5678", "02-8765-4321"],
            "위치": ["A-1-01", "B-2-03"],
            "창고": ["메인창고", "보조창고"],
            "설명": ["샘플 품목입니다.", "테스트용 품목"],
            "활성상태": [True, True]
        }
        
        return pd.DataFrame(sample_data)