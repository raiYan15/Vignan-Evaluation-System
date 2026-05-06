import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Loader2,
  X,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileImage,
  Layers,
} from "lucide-react";
import {
  evaluateBatchAsync,
  getBatchJob,
  type EvaluationResult,
  type BatchProgressEvent,
  ApiError,
} from "@/api/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function BatchEvaluation() {
  const [files, setFiles] = useState<File[]>([]);
  const [rubric, setRubric] = useState("");
  const [studentIdsCsv, setStudentIdsCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const imageFiles = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast({ title: "No valid images", description: "Only image files are accepted.", variant: "destructive" });
      return;
    }
    setFiles((prev) => [...prev, ...imageFiles]);
    setResults([]);
    setError(null);
  }, [toast]);

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const submit = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    setProgress(0);
    setCompleted(0);
    setTotal(files.length);
    setResults([]);

    try {
      const parsedStudentIds = studentIdsCsv
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      const start = await evaluateBatchAsync(files, rubric || undefined, parsedStudentIds.length ? parsedStudentIds : undefined);
      setJobId(start.job_id);

      const token = localStorage.getItem("vignan_access_token") || "";
      const wsUrl = `${start.websocket_url}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data) as BatchProgressEvent;
        if (payload.total) setTotal(payload.total);
        if (payload.completed >= 0) setCompleted(payload.completed);
        if (payload.percent >= 0) setProgress(payload.percent);

        if (payload.type === "snapshot" && payload.items) {
          setResults(payload.items);
          if (payload.status && payload.status !== "running") {
            setLoading(false);
          }
        }

        if (payload.type === "progress" && payload.latest) {
          setResults((prev) => {
            const idx = prev.findIndex((p) => p.item_index === payload.latest?.item_index);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = payload.latest;
              return next;
            }
            return [...prev, payload.latest];
          });
        }

        if (payload.type === "done") {
          setProgress(100);
          setLoading(false);
          if (payload.items) setResults(payload.items);
          toast({ title: "Batch complete", description: `${payload.completed} scripts evaluated in realtime.` });
          ws.close();
        }
      };

      ws.onerror = () => {
        if (pollRef.current) window.clearInterval(pollRef.current);
        pollRef.current = window.setInterval(async () => {
          try {
            const snap = await getBatchJob(start.job_id);
            const done = Number(snap.completed_files || 0);
            const all = Number(snap.total_files || 0);
            setCompleted(done);
            setTotal(all);
            setProgress(all > 0 ? Math.round((done / all) * 100) : 0);
            setResults(snap.items || []);
            if (snap.status && snap.status !== "running") {
              setLoading(false);
              if (pollRef.current) window.clearInterval(pollRef.current);
              toast({ title: "Batch complete", description: `${done} scripts evaluated.` });
            }
          } catch {
            // keep polling until server returns completion or user retries
          }
        }, 1500);
      };
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.detail : "Batch evaluation failed.";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
      setLoading(false);
    } finally {
      // completion is controlled by websocket/polling done event
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batch-results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    const headers = "File,Final Marks,Max Marks,HTR Confidence,Semantic Score,Keyword Score,Overall Confidence,Needs Review\n";
    const rows = results.map((r, i) =>
      `${files[i]?.name || i},${r.final_marks},${r.max_marks},${r.htr_confidence},${r.semantic_score},${r.keyword_score},${r.overall_confidence},${r.needs_manual_review}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batch-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const avgScore = results.length > 0 ? (results.reduce((s, r) => s + r.final_marks, 0) / results.length).toFixed(1) : null;
  const reviewCount = results.filter((r) => r.needs_manual_review).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Batch Evaluation</h1>
        <p className="page-subtitle">Process multiple answer sheets simultaneously</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload section */}
        <div className="lg:col-span-1 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            onClick={() => document.getElementById("batch-input")?.click()}
            className="glass-card p-6 flex flex-col items-center justify-center text-center min-h-[180px] cursor-pointer border-dashed border-2 border-border hover:border-primary/50 transition-all duration-300"
          >
            <input
              id="batch-input"
              type="file"
              accept="image/*"
              multiple
              title="Upload batch answer images"
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <Upload className="w-8 h-8 text-primary mb-3" />
            <p className="font-heading font-semibold text-sm">Drop images here</p>
            <p className="text-xs text-muted-foreground mt-1">Select multiple files</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="glass-card p-4 space-y-2 max-h-60 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{files.length} file(s)</p>
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded-md bg-secondary/40 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileImage className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate text-xs">{f.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    title="Remove file"
                    aria-label="Remove file"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="glass-card p-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Rubric (optional)</label>
            <Textarea
              placeholder='{"keywords": [...], "max_marks": 10}'
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              rows={2}
              className="bg-secondary/50 border-border/50 text-sm"
            />
          </div>

          <div className="glass-card p-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Student IDs (optional, comma separated)</label>
            <Textarea
              placeholder="23L31A0501, 23L31A0502, 23L31A0503"
              value={studentIdsCsv}
              onChange={(e) => setStudentIdsCsv(e.target.value)}
              rows={2}
              className="bg-secondary/50 border-border/50 text-sm"
            />
          </div>

          <Button onClick={submit} disabled={files.length === 0 || loading} className="w-full h-11 font-heading font-semibold">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing {completed}/{total || files.length} files…</>
            ) : (
              <><Layers className="w-4 h-4 mr-2" /> Evaluate Batch</>
            )}
          </Button>

          {jobId && <p className="text-xs text-muted-foreground text-center">Live Job ID: <span className="font-mono">{jobId}</span></p>}

          <Link to="/results" className="block text-center text-sm text-primary font-medium">Open Batch Results Display →</Link>

          {loading && (
            <div className="space-y-1">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground text-center">Realtime progress: {Math.round(progress)}%</p>
            </div>
          )}
        </div>

        {/* Results section */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {results.length > 0 && (
              <motion.div {...fadeUp} key="results" className="space-y-4">
                {/* Summary */}
                <div className="glass-card p-5 flex flex-wrap gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-heading font-bold">{results.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Score</p>
                    <p className="text-2xl font-heading font-bold gradient-text">{avgScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Needs Review</p>
                    <p className="text-2xl font-heading font-bold text-warning">{reviewCount}</p>
                  </div>
                  <div className="ml-auto flex items-end gap-2">
                    <Button variant="outline" size="sm" onClick={downloadJSON}><Download className="w-3.5 h-3.5 mr-1" /> JSON</Button>
                    <Button variant="outline" size="sm" onClick={downloadCSV}><Download className="w-3.5 h-3.5 mr-1" /> CSV</Button>
                  </div>
                </div>

                {/* Per-script cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground font-medium truncate max-w-[60%]">{files[i]?.name || `Script ${i + 1}`}</span>
                        {r.needs_manual_review ? (
                          <span className="flex items-center gap-1 text-warning text-xs"><AlertTriangle className="w-3 h-3" /> Review</span>
                        ) : (
                          <span className="flex items-center gap-1 text-success text-xs"><CheckCircle2 className="w-3 h-3" /> Pass</span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-heading font-bold">{r.final_marks}</span>
                        <span className="text-sm text-muted-foreground">/ {r.max_marks}</span>
                      </div>
                      <Progress value={Math.round(r.overall_confidence * 100)} className="h-2" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {error && !loading && (
              <motion.div {...fadeUp} key="error" className="glass-card p-8 flex flex-col items-center justify-center min-h-[300px]">
                <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
                <p className="font-heading font-semibold">Batch Failed</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </motion.div>
            )}

            {results.length === 0 && !error && !loading && (
              <motion.div {...fadeUp} key="empty" className="glass-card p-8 flex flex-col items-center justify-center min-h-[300px]">
                <Layers className="w-10 h-10 text-muted-foreground/40 mb-4" />
                <p className="font-heading font-semibold text-muted-foreground">No batch results</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Upload images and run batch evaluation</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
