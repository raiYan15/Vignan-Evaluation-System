const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

const DEFAULT_TIMEOUT = 120000;

interface ApiOptions {
  timeout?: number;
  retries?: number;
}

interface ApiEnvelope<T> {
  status: "success" | "pending_review" | "error";
  request_id: string;
  data: T;
  confidence: number;
  processing_time_ms: number;
  timestamp: string;
}

class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err: unknown) {
    clearTimeout(id);
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(408, "Request timed out. The model may be processing a large image.");
    }
    throw err;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.detail || data.message || JSON.stringify(data);
  } catch {
    return `HTTP ${res.status}: ${res.statusText}`;
  }
}

function authHeader(existing?: HeadersInit): HeadersInit {
  const token = localStorage.getItem("vignan_access_token");
  const headers = new Headers(existing || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  apiOptions: ApiOptions = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, retries = 1 } = apiOptions;
  const url = `${API_BASE_URL}${endpoint}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetchWithTimeout(
        url,
        {
          ...options,
          headers: authHeader(options.headers),
        },
        timeout
      );
      if (!res.ok) {
        const detail = await parseError(res);
        throw new ApiError(res.status, detail);
      }
      const payload = await res.json();
      if (payload && typeof payload === "object" && "status" in payload && "data" in payload) {
        return (payload as ApiEnvelope<T>).data;
      }
      return payload as T;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error("Request failed");
      if (err instanceof ApiError && err.status < 500) throw err;
      if (attempt < retries - 1) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastError || new Error("Request failed");
}

export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  role: "faculty" | "student" | "admin";
  faculty_id?: string;
  roll_number?: string;
  department?: string;
  branch?: string;
  section?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface FacultyRegisterPayload {
  name: string;
  faculty_id: string;
  email: string;
  password: string;
  department: string;
}

export interface StudentRegisterPayload {
  name: string;
  roll_number: string;
  email: string;
  password: string;
  branch: string;
  section: string;
}

export async function registerFaculty(payload: FacultyRegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register/faculty", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function registerStudent(payload: StudentRegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register/student", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser(): Promise<{ user: UserProfile }> {
  return request<{ user: UserProfile }>("/auth/me", {
    method: "GET",
  });
}

export interface EvaluationResult {
  recognized_text: string;
  htr_confidence: number;
  semantic_score: number;
  keyword_score: number;
  final_marks: number;
  max_marks: number;
  overall_confidence: number;
  needs_manual_review: boolean;
  feedback: string;
  processing_time?: number;
  status?: string;
  item_index?: number;
}

export interface StoredEvaluation {
  request_id: string;
  scores: {
    semantic_score: number;
    keyword_score: number;
    final_marks: number;
    max_marks: number;
  };
  confidence: number;
  status: string;
  recognized_text: string;
  manual_review_flag: boolean;
  processing_time: number;
  student_id?: string;
  batch_id?: string;
  timestamp: string;
  mis_evaluation_reported?: boolean;
  mis_evaluation_reason?: string | null;
  mis_evaluation_reported_by?: string;
  mis_evaluation_reported_at?: string;
}

export async function reportMisEvaluation(requestId: string, reason?: string): Promise<{
  request_id: string;
  student_id: string;
  reported: boolean;
  status: string;
}> {
  return request(`/results/${encodeURIComponent(requestId)}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: (reason || "").trim() || undefined }),
  });
}

export interface ResultsResponse {
  items: StoredEvaluation[];
  total: number;
  page: number;
  page_size: number;
  role: string;
}

export interface ClassSummary {
  branch: string;
  section: string;
  my_rank: number | null;
  average: number;
  top_score: number;
  students: {
    student_id: string;
    average_score: number;
    evaluations: number;
    avg_confidence: number;
    rank: number;
  }[];
}

export interface BatchAsyncStartResponse {
  job_id: string;
  status: string;
  total_files: number;
  websocket_url: string;
}

export interface BatchJobSnapshot {
  request_id: string;
  status: string;
  total_files: number;
  completed_files: number;
  avg_confidence: number;
  processing_time: number;
  items: EvaluationResult[];
}

export interface BatchProgressEvent {
  type: "snapshot" | "progress" | "done";
  job_id: string;
  status?: string;
  total: number;
  completed: number;
  percent: number;
  latest?: EvaluationResult;
  items?: EvaluationResult[];
  avg_confidence?: number;
  processing_time?: number;
}

export async function evaluateSingle(
  file: File,
  rubric?: string,
  studentId?: string
): Promise<EvaluationResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (rubric) formData.append("rubric", rubric);
  if (studentId) formData.append("student_id", studentId);

  return request<EvaluationResult>("/evaluate", {
    method: "POST",
    body: formData,
  });
}

export async function evaluateBatch(
  files: File[],
  rubric?: string,
  studentIds?: string[]
): Promise<EvaluationResult[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  if (rubric) formData.append("rubric", rubric);
  if (studentIds && studentIds.length > 0) formData.append("student_ids", JSON.stringify(studentIds));

  const data = await request<{ items?: EvaluationResult[] } | EvaluationResult[]>("/evaluate/batch", {
    method: "POST",
    body: formData,
  }, { timeout: 300000 });

  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "items" in data && Array.isArray(data.items)) {
    return data.items;
  }
  return [];
}

export async function evaluateBatchAsync(
  files: File[],
  rubric?: string,
  studentIds?: string[]
): Promise<BatchAsyncStartResponse> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  if (rubric) formData.append("rubric", rubric);
  if (studentIds && studentIds.length > 0) formData.append("student_ids", JSON.stringify(studentIds));

  return request<BatchAsyncStartResponse>("/evaluate/batch/async", {
    method: "POST",
    body: formData,
  }, { timeout: 300000 });
}

export async function getBatchJob(jobId: string): Promise<BatchJobSnapshot> {
  return request<BatchJobSnapshot>(`/batch-jobs/${jobId}`);
}

export async function getResults(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}): Promise<ResultsResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    page_size: String(params.pageSize),
  });
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  return request<ResultsResponse>(`/results?${query.toString()}`);
}

export async function getClassSummary(): Promise<ClassSummary> {
  return request<ClassSummary>("/results/class-summary");
}

export interface HealthStatus {
  api_status: string;
  mongo_status: string;
  gemini_enabled?: boolean;
  cuda_available: boolean;
  queue_depth: number;
  avg_latency: number;
  model_status: string;
  version: string;
  engine_mode: string;
  timestamp?: string;
}

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  relevance: number;
}

export interface CompareResult {
  student_text: string;
  similarities: { source: string; score: number }[];
  average_similarity: number;
  matching_concepts: string[];
}

export async function searchAnswers(
  query: string,
  sources?: string[]
): Promise<SearchResult[]> {
  return request<SearchResult[]>("/search/answers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, sources }),
  });
}

export async function compareAnswer(
  studentAnswer: string,
  referenceAnswers?: string[]
): Promise<CompareResult> {
  return request<CompareResult>("/search/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_answer: studentAnswer, reference_answers: referenceAnswers }),
  });
}

export async function getHealth(): Promise<HealthStatus> {
  return request<HealthStatus>("/health", {}, { timeout: 10000, retries: 2 });
}

export { ApiError };
