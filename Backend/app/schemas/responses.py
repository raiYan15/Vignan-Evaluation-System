from pydantic import BaseModel


class EvaluationData(BaseModel):
    recognized_text: str
    htr_confidence: float
    semantic_score: float
    keyword_score: float
    final_marks: float
    max_marks: float
    overall_confidence: float
    needs_manual_review: bool
    feedback: str
    processing_time: float
    status: str
