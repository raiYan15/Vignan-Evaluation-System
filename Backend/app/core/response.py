from datetime import datetime, timezone
from typing import Any


def make_response(
    *,
    status: str,
    request_id: str,
    data: Any,
    confidence: float,
    processing_time_ms: float,
) -> dict[str, Any]:
    return {
        "status": status,
        "request_id": request_id,
        "data": data,
        "confidence": confidence,
        "processing_time_ms": processing_time_ms,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
