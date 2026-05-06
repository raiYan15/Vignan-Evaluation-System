from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: Literal["development", "production"] = Field(default="development", alias="APP_ENV")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")

    mongo_enabled: bool = Field(default=True, alias="MONGO_ENABLED")
    mongo_uri: str = Field(default="mongodb://localhost:27017", alias="MONGO_URI")
    mongo_db: str = Field(default="vignan_evaluator", alias="MONGO_DB")
    mongo_connect_timeout_ms: int = Field(default=2000, alias="MONGO_CONNECT_TIMEOUT_MS")
    mongo_server_selection_timeout_ms: int = Field(default=2000, alias="MONGO_SERVER_SELECTION_TIMEOUT_MS")
    mongo_max_pool_size: int = Field(default=100, alias="MONGO_MAX_POOL_SIZE")
    mongo_min_pool_size: int = Field(default=5, alias="MONGO_MIN_POOL_SIZE")

    engine_mode: Literal["auto", "mock", "real"] = Field(default="auto", alias="ENGINE_MODE")
    engine_timeout_seconds: int = Field(default=90, alias="ENGINE_TIMEOUT_SECONDS")
    batch_max_parallelism: int = Field(default=8, alias="BATCH_MAX_PARALLELISM")
    confidence_threshold: float = Field(default=0.65, alias="CONFIDENCE_THRESHOLD")

    cors_allow_origins: str = Field(default="http://localhost:5173,http://127.0.0.1:5173", alias="CORS_ALLOW_ORIGINS")

    rate_limit_evaluate: int = Field(default=30, alias="RATE_LIMIT_EVALUATE")
    rate_limit_batch: int = Field(default=10, alias="RATE_LIMIT_BATCH")
    rate_limit_search: int = Field(default=60, alias="RATE_LIMIT_SEARCH")
    rate_limit_window_seconds: int = Field(default=60, alias="RATE_LIMIT_WINDOW_SECONDS")

    upload_dir: str = Field(default="uploads", alias="UPLOAD_DIR")
    results_dir: str = Field(default="results", alias="RESULTS_DIR")
    max_upload_size_mb: int = Field(default=15, alias="MAX_UPLOAD_SIZE_MB")
    allowed_mime_types: str = Field(default="image/png,image/jpeg,image/webp", alias="ALLOWED_MIME_TYPES")
    file_retention_hours: int = Field(default=24, alias="FILE_RETENTION_HOURS")

    admin_token: str = Field(default="change-me-admin-token", alias="ADMIN_TOKEN")
    jwt_secret_key: str = Field(default="change-me-jwt-secret", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(default=720, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    search_timeout_ms: int = Field(default=4000, alias="SEARCH_TIMEOUT_MS")
    search_cache_ttl_seconds: int = Field(default=120, alias="SEARCH_CACHE_TTL_SECONDS")
    search_circuit_breaker_fail_threshold: int = Field(default=5, alias="SEARCH_CIRCUIT_BREAKER_FAIL_THRESHOLD")
    search_circuit_breaker_reset_seconds: int = Field(default=20, alias="SEARCH_CIRCUIT_BREAKER_RESET_SECONDS")
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-2.0-flash", alias="GEMINI_MODEL")
    gemini_temperature: float = Field(default=0.2, alias="GEMINI_TEMPERATURE")
    gemini_max_output_tokens: int = Field(default=1024, alias="GEMINI_MAX_OUTPUT_TOKENS")
    trained_model_enabled: bool = Field(default=True, alias="TRAINED_MODEL_ENABLED")
    trained_model_path: str = Field(default="results/answer_evaluator_model.pkl", alias="TRAINED_MODEL_PATH")
    handwriting_model_enabled: bool = Field(default=True, alias="HANDWRITING_MODEL_ENABLED")
    handwriting_model_path: str = Field(
        default="results/handwriting_recognition_model.pkl",
        alias="HANDWRITING_MODEL_PATH",
    )

    @property
    def cors_origins(self) -> list[str]:
        parsed = [origin.strip() for origin in self.cors_allow_origins.split(",") if origin.strip()]
        if parsed:
            return parsed
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    @property
    def allowed_mime(self) -> set[str]:
        return {mime.strip() for mime in self.allowed_mime_types.split(",") if mime.strip()}


@lru_cache
def get_settings() -> Settings:
    return Settings()
