from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, Mapping
from zoneinfo import ZoneInfo


KST = ZoneInfo("Asia/Seoul")

TEMPLATE_PARAMETER_NAMES = frozenset({
    "request_number",
    "item_name",
    "quantity",
    "total_budget",
    "urgency",
    "requester",
    "request_date",
    "detail_url",
})

REQUIRED_PURCHASE_REQUEST_FIELDS = (
    "request_number",
    "item_name",
    "quantity",
    "requester_name",
    "department",
    "request_date",
)

URGENCY_LABELS = {
    "LOW": "낮음",
    "NORMAL": "보통",
    "HIGH": "높음",
    "URGENT": "긴급",
    "EMERGENCY": "비상",
}


def _format_quantity(quantity: Any, unit: Any) -> str:
    value = str(quantity)
    unit_value = str(unit or "").strip()
    return f"{value} {unit_value}".strip()


def _format_budget(value: Any) -> str:
    if value is None or value == "":
        return "미입력"
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, ValueError):
        return str(value)
    if amount == amount.to_integral_value():
        return f"{int(amount):,}원"
    return f"{amount:,.2f}원"


def _format_request_date(value: Any) -> str:
    if not isinstance(value, datetime):
        raise ValueError("request_date must be a datetime")
    # Existing DB values are naive UTC datetimes.
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(KST).strftime("%Y-%m-%d %H:%M")


def build_template_parameters(
    purchase_request: Mapping[str, Any], public_base_url: str
) -> Dict[str, str]:
    """Create values whose keys exactly match the approved Kakao template."""
    missing = [
        field for field in REQUIRED_PURCHASE_REQUEST_FIELDS
        if purchase_request.get(field) is None
    ]
    if missing:
        raise ValueError(
            f"Missing purchase request fields: {', '.join(missing)}"
        )
    if not public_base_url.strip():
        raise ValueError("public_base_url is required")

    request_number = str(purchase_request["request_number"])
    urgency = str(purchase_request.get("urgency") or "NORMAL").upper()
    requester_name = str(purchase_request.get("requester_name") or "").strip()
    department = str(purchase_request.get("department") or "").strip()

    parameters = {
        "request_number": request_number,
        "item_name": str(purchase_request["item_name"]),
        "quantity": _format_quantity(
            purchase_request["quantity"], purchase_request.get("unit")
        ),
        "total_budget": _format_budget(purchase_request.get("total_budget")),
        "urgency": URGENCY_LABELS.get(urgency, urgency),
        "requester": f"{requester_name} / {department}",
        "request_date": _format_request_date(purchase_request["request_date"]),
        # The current frontend exposes only this route (no per-request route).
        "detail_url": f"{public_base_url.rstrip('/')}/purchase-requests",
    }
    if parameters.keys() != TEMPLATE_PARAMETER_NAMES:
        raise RuntimeError("Template parameter names do not match the approved template")
    return parameters
