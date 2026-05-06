from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class SearchAnswersRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: str = Field(min_length=2, max_length=500)
    sources: list[str] | None = None


class CompareAnswerRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    student_answer: str = Field(min_length=1, max_length=10000)
    reference_answers: list[str] | None = None


class RubricConfig(BaseModel):
    model_config = ConfigDict(extra="allow")
    keywords: list[str] | None = None
    max_marks: int | float | None = None


class ConfigUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    confidence_threshold: float | None = Field(default=None, ge=0, le=1)
    engine_mode: str | None = None
    batch_max_parallelism: int | None = Field(default=None, ge=1, le=64)


class SearchHistoryEntry(BaseModel):
    query: str
    results_count: int
    latency_ms: float
    timestamp: str


class SearchResponse(BaseModel):
    results: list[dict[str, Any]]


class FacultyRegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=2, max_length=120)
    faculty_id: str = Field(min_length=2, max_length=64)
    email: str = Field(min_length=5, max_length=200)
    password: str = Field(min_length=8, max_length=200)
    department: str = Field(min_length=2, max_length=100)


class StudentRegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=2, max_length=120)
    roll_number: str = Field(min_length=2, max_length=64)
    email: str = Field(min_length=5, max_length=200)
    password: str = Field(min_length=8, max_length=200)
    branch: str = Field(min_length=2, max_length=100)
    section: str = Field(min_length=1, max_length=32)


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str = Field(min_length=5, max_length=200)
    password: str = Field(min_length=8, max_length=200)


class ResultsQuery(BaseModel):
    model_config = ConfigDict(extra="forbid")
    page: int = Field(default=1, ge=1, le=1000)
    page_size: int = Field(default=10, ge=1, le=100)
    search: str | None = Field(default=None, max_length=120)
    status: str | None = Field(default=None, max_length=40)


class MisEvaluationReportRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    reason: str | None = Field(default=None, max_length=1000)


class TrainModelRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    dataset_path: str = Field(min_length=1, max_length=1000)
    metadata: dict[str, Any] | None = None
    target_columns: list[str] = Field(default_factory=lambda: ["concept_coverage", "correctness", "depth", "relevance"])
    task: str = Field(default="answer_evaluation_regression", min_length=3, max_length=120)
    output_model_path: str | None = Field(default=None, max_length=1000)
    test_size: float = Field(default=0.25, gt=0, lt=0.9)
    random_state: int = Field(default=42, ge=0, le=999999)
