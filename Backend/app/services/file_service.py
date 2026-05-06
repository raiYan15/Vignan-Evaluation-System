from __future__ import annotations

import asyncio
import os
import shutil
import time
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import Settings


def sanitize_filename(name: str) -> str:
    safe = "".join(c for c in name if c.isalnum() or c in {".", "-", "_"}).strip(".")
    return safe or f"upload_{int(time.time())}.bin"


class FileService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.upload_dir = Path(settings.upload_dir)
        self.results_dir = Path(settings.results_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.results_dir.mkdir(parents=True, exist_ok=True)

    async def validate_and_read(self, file: UploadFile) -> tuple[bytes, str]:
        if file.content_type not in self.settings.allowed_mime:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

        content = await file.read()
        max_size = self.settings.max_upload_size_mb * 1024 * 1024
        if len(content) > max_size:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")
        return content, sanitize_filename(file.filename or "upload.bin")

    async def periodic_cleanup(self) -> None:
        while True:
            await asyncio.sleep(1800)
            self.cleanup_old_files()

    def cleanup_old_files(self) -> None:
        cutoff = time.time() - (self.settings.file_retention_hours * 3600)
        for folder in (self.upload_dir, self.results_dir):
            for item in folder.glob("**/*"):
                if not item.is_file():
                    continue
                if item.stat().st_mtime < cutoff:
                    try:
                        item.unlink(missing_ok=True)
                    except OSError:
                        pass

    def disk_safety_check(self) -> dict[str, float]:
        usage = shutil.disk_usage(self.upload_dir)
        used_pct = round((usage.used / usage.total) * 100, 2) if usage.total else 0
        return {
            "total_gb": round(usage.total / (1024**3), 2),
            "free_gb": round(usage.free / (1024**3), 2),
            "used_pct": used_pct,
        }
