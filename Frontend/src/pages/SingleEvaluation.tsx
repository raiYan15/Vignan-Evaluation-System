import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileImage,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { evaluateSingle, type EvaluationResult, ApiError } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function ConfidenceMeter({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-destructive";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="confidence-bar">
        <motion.div
          className={`confidence-bar-fill ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ background: undefined }}
        />
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors p-1">
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function SingleEvaluation() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rubric, setRubric] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await evaluateSingle(file, rubric || undefined, studentId || undefined);
      setResult(res);
      toast({ title: "Evaluation complete", description: `Score: ${res.final_marks}/${res.max_marks}` });
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.detail : "Failed to evaluate. Is the backend running?";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Single Evaluation</h1>
        <p className="page-subtitle">Upload a handwritten answer for AI-powered grading</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Panel */}
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !file && document.getElementById("file-input")?.click()}
            className={`glass-card p-8 flex flex-col items-center justify-center text-center min-h-[280px] cursor-pointer transition-all duration-300 ${
              !file ? "border-dashed border-2 border-border hover:border-primary/50" : ""
            }`}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              title="Upload answer image"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {preview ? (
              <div className="relative w-full">
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  title="Remove uploaded image"
                  aria-label="Remove uploaded image"
                  className="absolute -top-2 -right-2 z-10 p-1 rounded-full bg-destructive text-destructive-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
                <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded-lg" />
                <p className="mt-3 text-xs text-muted-foreground truncate">{file?.name}</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="font-heading font-semibold mb-1">Drop image here</p>
                <p className="text-sm text-muted-foreground">or click to browse · PNG, JPG up to 10MB</p>
              </>
            )}
          </div>

          <div className="glass-card p-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Rubric (optional JSON)
            </label>
            <Textarea
              placeholder='{"keywords": ["photosynthesis", "chlorophyll"], "max_marks": 10}'
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              rows={3}
              className="bg-secondary/50 border-border/50 text-sm"
            />
          </div>

          <div className="glass-card p-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Student ID (optional)
            </label>
            <Input
              placeholder="e.g. 23L31A0501"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>

          <Button
            onClick={submit}
            disabled={!file || loading}
            className="w-full h-11 font-heading font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Evaluating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Evaluate Answer
              </>
            )}
          </Button>
          <Link to="/results" className="block text-center text-sm text-primary font-medium">Open Batch Results Display →</Link>
        </div>

        {/* Results Panel */}
        <div>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div {...fadeUp} key="loading" className="glass-card p-8 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="font-heading font-semibold">Processing answer…</p>
                <p className="text-sm text-muted-foreground mt-1">Running OCR → NLP → Scoring pipeline</p>
              </motion.div>
            )}

            {error && !loading && (
              <motion.div {...fadeUp} key="error" className="glass-card p-8 flex flex-col items-center justify-center min-h-[400px]">
                <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
                <p className="font-heading font-semibold mb-1">Evaluation Failed</p>
                <p className="text-sm text-muted-foreground text-center max-w-sm">{error}</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div {...fadeUp} key="result" className="space-y-4">
                {/* Score Card */}
                <div className="glass-card p-6 gradient-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Final Score</span>
                    {result.needs_manual_review && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 text-warning text-xs font-semibold">
                        <AlertTriangle className="w-3 h-3" /> Review Needed
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-heading font-bold gradient-text">{result.final_marks}</span>
                    <span className="text-xl text-muted-foreground font-heading">/ {result.max_marks}</span>
                  </div>
                </div>

                {/* Confidence Meters */}
                <div className="glass-card p-5 space-y-3">
                  <ConfidenceMeter value={result.overall_confidence} label="Overall Confidence" />
                  <ConfidenceMeter value={result.htr_confidence} label="HTR Confidence" />
                  <ConfidenceMeter value={result.semantic_score} label="Semantic Score" />
                  <ConfidenceMeter value={result.keyword_score} label="Keyword Score" />
                </div>

                {/* Recognized Text */}
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recognized Text</span>
                    <CopyButton text={result.recognized_text} />
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">{result.recognized_text}</p>
                </div>

                {/* Feedback */}
                {result.feedback && (
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Feedback</span>
                    </div>
                    <p className="text-sm leading-relaxed text-secondary-foreground">{result.feedback}</p>
                  </div>
                )}
              </motion.div>
            )}

            {!loading && !error && !result && (
              <motion.div {...fadeUp} key="empty" className="glass-card p-8 flex flex-col items-center justify-center min-h-[400px]">
                <FileImage className="w-10 h-10 text-muted-foreground/40 mb-4" />
                <p className="font-heading font-semibold text-muted-foreground">No results yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Upload an image and click evaluate</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
