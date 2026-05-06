import json
import logging
import sys
import time
from contextvars import ContextVar
from datetime import datetime, timezone

request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_ctx.get(""),
        }
        if hasattr(record, "extra_fields"):
            payload.update(record.extra_fields)
        return json.dumps(payload, ensure_ascii=False)


def configure_logging(level: int = logging.INFO) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers.clear()
    root.setLevel(level)
    root.addHandler(handler)


def timed_logger(logger: logging.Logger, message: str, **fields: object):
    start = time.perf_counter()

    def _done(**done_fields: object) -> None:
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        merged = {**fields, **done_fields, "duration_ms": elapsed_ms}
        logger.info(message, extra={"extra_fields": merged})

    return _done
