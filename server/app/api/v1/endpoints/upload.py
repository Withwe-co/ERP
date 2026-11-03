from datetime import datetime
from pathlib import Path
from typing import Any, List, Optional
import uuid
from zoneinfo import ZoneInfo

import pandas as pd
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import settings
from app.models.excel_upload_history import ExcelUploadHistory
from app.models.unified_inventory import UnifiedInventory

router = APIRouter()

REQUIRED_COLUMNS = ("품목코드", "품목명", "카테고리")


def cell_text(row: pd.Series, column: str) -> str:
    """Return an empty string for missing/blank Excel values."""
    value = row.get(column)
    if value is None or pd.isna(value):
        return ""
    return str(value).strip()


def cell_number(row: pd.Series, column: str) -> Optional[float]:
    value = row.get(column)
    if value is None or pd.isna(value) or str(value).strip() == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def first_text(row: pd.Series, *columns: str) -> str:
    for column in columns:
        value = cell_text(row, column)
        if value:
            return value
    return ""


def first_number(row: pd.Series, *columns: str) -> Optional[float]:
    for column in columns:
        value = cell_number(row, column)
        if value is not None:
            return value
    return None


def inventory_values_from_row(row: pd.Series, uploader: str) -> dict[str, Any]:
    """Build an InventoryPage-compatible record; optional Excel columns stay blank."""
    minimum_stock = first_number(row, "최소재고")
    maximum_stock = first_number(row, "최대재고")
    current_quantity = first_number(row, "현재 재고", "현재재고")
    imported_quantity = int(current_quantity) if current_quantity is not None else 0
    receipt_date = datetime.now(ZoneInfo("Asia/Seoul"))
    values = {
        "item_code": cell_text(row, "품목코드"),
        "item_name": cell_text(row, "품목명"),
        "category": cell_text(row, "카테고리"),
        "brand": cell_text(row, "브랜드") or None,
        "specifications": cell_text(row, "사양") or None,
        "unit": first_text(row, "단위"),
        "unit_price": first_number(row, "기준 단가", "기준단가", "단가", "단위단가"),
        "currency": first_text(row, "통화"),
        "location": cell_text(row, "위치") or None,
        "warehouse": cell_text(row, "창고") or None,
        "supplier_name": cell_text(row, "공급업체") or cell_text(row, "공급업체명") or None,
        "supplier_contact": cell_text(row, "공급업체연락처") or None,
        "minimum_stock": int(minimum_stock) if minimum_stock is not None else 0,
        "maximum_stock": int(maximum_stock) if maximum_stock is not None else None,
        "description": cell_text(row, "설명") or None,
        "notes": cell_text(row, "비고") or None,
        # Excel imports are considered received immediately.
        "total_received": imported_quantity,
        "receipt_history": [{
            "id": 1,
            "source": "excel_upload",
            "receipt_number": f"EXCEL-{receipt_date.strftime('%Y%m%d%H%M%S')}",
            "item_name": cell_text(row, "품목명"),
            "item_code": cell_text(row, "품목코드"),
            "expected_quantity": imported_quantity,
            "received_date": receipt_date.isoformat(),
            "received_quantity": imported_quantity,
            "receiver_name": uploader,
            "receiver_email": None,
            "department": "Excel 업로드",
            "location": cell_text(row, "위치") or None,
            "condition": "good",
            "notes": "Excel 파일 업로드",
            "image_urls": [],
            "is_complete": True,
            "quality_check_passed": True,
            "created_at": receipt_date.isoformat(),
        }],
        "last_received_date": receipt_date,
        "last_received_by": uploader,
        "last_received_department": None,
        "condition_quantities": {
            "excellent": 0,
            "good": imported_quantity,
            "damaged": 0,
            "defective": 0,
        },
        "is_active": True,
        "is_receipt_only": False,
        "created_by": uploader,
        "updated_by": uploader,
    }

    # Preserve an existing item's inventory when the spreadsheet has no stock column.
    if "현재 재고" in row.index or "현재재고" in row.index:
        values["current_quantity"] = int(current_quantity) if current_quantity is not None else 0

    return values


def excel_preview(relative_path: Optional[str]) -> tuple[int, List[dict[str, Any]], Optional[str]]:
    """Return a safe, small preview of an uploaded spreadsheet for the history cards."""
    if not relative_path:
        return 0, [], "저장 경로가 없습니다."

    upload_root = Path(settings.UPLOAD_DIR).resolve()
    stored_path = (upload_root / relative_path).resolve()
    if upload_root not in stored_path.parents or not stored_path.is_file():
        return 0, [], "저장된 파일을 찾을 수 없습니다."

    try:
        dataframe = pd.read_excel(stored_path)
        dataframe.columns = [str(column).strip() for column in dataframe.columns]
        preview_rows: List[dict[str, Any]] = []
        for _, row in dataframe.head(50).iterrows():
            preview_rows.append({
                column: (None if pd.isna(value) else str(value))
                for column, value in row.to_dict().items()
            })
        return len(dataframe), preview_rows, None
    except Exception as error:
        return 0, [], f"Excel 내용을 읽지 못했습니다: {error}"


@router.post("/excel")
async def upload_excel(
    file: UploadFile = File(...),
    uploader: str = Form(...),
    db: Session = Depends(get_db),
):
    """Save the original file, record upload metadata, and import inventory rows."""
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Excel 파일만 업로드 가능합니다 (.xlsx, .xls).")

    uploader = uploader.strip()
    if not uploader:
        raise HTTPException(status_code=400, detail="업로더명을 입력해주세요.")
    if len(uploader) > 100:
        raise HTTPException(status_code=400, detail="업로더명은 100자 이하여야 합니다.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="빈 파일은 업로드할 수 없습니다.")
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="파일 크기는 50MB를 초과할 수 없습니다.")

    original_filename = Path(file.filename).name
    extension = Path(original_filename).suffix.lower()
    stored_filename = f"{uuid.uuid4().hex}{extension}"
    relative_path = str(Path("inventory-excel") / stored_filename)
    upload_directory = Path(settings.UPLOAD_DIR) / "inventory-excel"
    upload_directory.mkdir(parents=True, exist_ok=True)
    saved_file_path = upload_directory / stored_filename
    upload_date = datetime.now(ZoneInfo("Asia/Seoul")).date()

    try:
        saved_file_path.write_bytes(content)
        dataframe = pd.read_excel(saved_file_path)
        dataframe.columns = [str(column).strip() for column in dataframe.columns]

        missing_columns = [column for column in REQUIRED_COLUMNS if column not in dataframe.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"필수 컬럼이 없습니다: {', '.join(missing_columns)}",
            )
        if len(dataframe) > 1000:
            raise HTTPException(status_code=400, detail="한 번에 최대 1,000개 품목까지 업로드할 수 있습니다.")

        created_items: List[str] = []
        updated_items: List[str] = []
        errors: List[dict[str, Any]] = []

        for index, row in dataframe.iterrows():
            row_number = index + 2
            values = inventory_values_from_row(row, uploader)
            missing_values = [column for column in REQUIRED_COLUMNS if not values[{"품목코드": "item_code", "품목명": "item_name", "카테고리": "category"}[column]]]
            if missing_values:
                errors.append({"row": row_number, "field": ", ".join(missing_values), "message": "필수값이 비어 있습니다."})
                continue

            try:
                existing_item = db.query(UnifiedInventory).filter(
                    UnifiedInventory.item_code == values["item_code"]
                ).first()
                if existing_item:
                    for field, value in values.items():
                        if field != "item_code":
                            setattr(existing_item, field, value)
                    updated_items.append(values["item_code"])
                else:
                    db.add(UnifiedInventory(**values))
                    created_items.append(values["item_code"])
            except Exception as error:
                errors.append({"row": row_number, "field": "품목", "message": str(error)})

        history = ExcelUploadHistory(
            upload_date=upload_date,
            file_name=original_filename,
            uploader=uploader,
            stored_filename=stored_filename,
            relative_path=relative_path,
        )
        db.add(history)
        db.commit()
        db.refresh(history)
    except HTTPException:
        db.rollback()
        if saved_file_path.exists():
            saved_file_path.unlink()
        raise
    except Exception as error:
        db.rollback()
        if saved_file_path.exists():
            saved_file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Excel 처리 중 오류가 발생했습니다: {error}")

    return {
        "success": True,
        "message": f"업로드 완료: {len(created_items)}개 신규 등록, {len(updated_items)}개 수정",
        "filename": original_filename,
        "uploader": uploader,
        "upload_date": upload_date.isoformat(),
        "stored_filename": stored_filename,
        "relative_path": relative_path,
        "history_id": history.id,
        "created_count": len(created_items),
        "updated_count": len(updated_items),
        "created_items": created_items,
        "updated_items": updated_items,
        "total_processed": len(created_items) + len(updated_items),
        "errors": errors,
    }


@router.get("/history")
def get_upload_history(db: Session = Depends(get_db)):
    """Return recent Excel uploads for the UploadPage history cards."""
    records = (
        db.query(ExcelUploadHistory)
        .order_by(ExcelUploadHistory.id.desc())
        .limit(100)
        .all()
    )
    history = []
    for record in records:
        total_rows, preview_items, preview_error = excel_preview(record.relative_path)
        history.append({
            "id": record.id,
            "upload_date": record.upload_date.isoformat() if record.upload_date else None,
            "file_name": record.file_name,
            "uploader": record.uploader,
            "total_rows": total_rows,
            "preview_items": preview_items,
            "preview_error": preview_error,
        })
    return history


@router.get("/history/{history_id}/download")
def download_uploaded_file(history_id: int, db: Session = Depends(get_db)):
    """Download a stored Excel file using its upload-history id."""
    record = db.query(ExcelUploadHistory).filter(ExcelUploadHistory.id == history_id).first()
    if not record or not record.relative_path:
        raise HTTPException(status_code=404, detail="업로드 이력을 찾을 수 없습니다.")

    upload_root = Path(settings.UPLOAD_DIR).resolve()
    stored_path = (upload_root / record.relative_path).resolve()
    if upload_root not in stored_path.parents or not stored_path.is_file():
        raise HTTPException(status_code=404, detail="저장된 파일을 찾을 수 없습니다.")

    return FileResponse(
        path=stored_path,
        filename=record.file_name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@router.get("/template")
async def download_template():
    return {
        "message": "Excel 템플릿 정보",
        "required_columns": list(REQUIRED_COLUMNS),
    }


@router.get("/")
async def get_upload_info():
    return {
        "supported_formats": [".xlsx", ".xls"],
        "max_file_size": "50MB",
        "max_files": 1,
        "endpoints": {"excel": "/api/v1/upload/excel", "template": "/api/v1/upload/template"},
    }
