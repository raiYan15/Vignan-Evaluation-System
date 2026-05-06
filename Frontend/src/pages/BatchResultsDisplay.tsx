import { useEffect, useMemo, useState } from "react";
import { getResults, reportMisEvaluation, type StoredEvaluation, ApiError } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type ViewMode = "table" | "card";

function confidenceLabel(value: number) {
  if (value >= 0.8) return "High";
  if (value >= 0.55) return "Medium";
  return "Low";
}

export default function BatchResultsDisplay({ scope = "all" }: { scope?: "all" | "self" | "class" }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<StoredEvaluation[]>([]);
  const [reportingId, setReportingId] = useState<string | null>(null);

  const pageSize = 10;

  const isStudent = user?.role === "student";

  const loadResults = async () => {
    setLoading(true);
    try {
      const data = await getResults({ page, pageSize, search: search || undefined, status: status || undefined });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast({ title: "Failed to load results", description: err instanceof ApiError ? err.detail : "Please retry.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    async function load() {
      await loadResults();
      if (!active) return;
    }
    load();
    return () => {
      active = false;
    };
  }, [page, search, status, toast]);

  const handleReport = async (item: StoredEvaluation) => {
    const reason = window.prompt("Optional reason for re-evaluation request:", item.mis_evaluation_reason || "") || "";
    setReportingId(item.request_id);
    try {
      await reportMisEvaluation(item.request_id, reason);
      toast({ title: "Report submitted", description: "Faculty has been notified for manual review." });
      await loadResults();
    } catch (err) {
      toast({
        title: "Report failed",
        description: err instanceof ApiError ? err.detail : "Please retry.",
        variant: "destructive",
      });
    } finally {
      setReportingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const exported = useMemo(() => items.map((i) => ({
    request_id: i.request_id,
    student_id: i.student_id,
    final_marks: i.scores?.final_marks,
    max_marks: i.scores?.max_marks,
    confidence: i.confidence,
    status: i.status,
    manual_review: i.manual_review_flag,
    timestamp: i.timestamp,
  })), [items]);

  const download = (type: "json" | "csv") => {
    if (type === "json") {
      const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `results-${scope}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const header = "Request ID,Student ID,Final Marks,Max Marks,Confidence,Status,Manual Review,Timestamp\n";
    const rows = exported.map((r) => `${r.request_id},${r.student_id || ""},${r.final_marks || 0},${r.max_marks || 0},${r.confidence},${r.status},${r.manual_review},${r.timestamp}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results-${scope}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">Batch Results Display</h1>
        <p className="page-subtitle">Professional results viewer with filters, search, confidence and export</p>
      </div>

      <div className="glass-card p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <Input placeholder="Search by request id, text or student id" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={status}
          title="Filter results by status"
          aria-label="Filter results by status"
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
        >
          <option value="">All statuses</option>
          <option value="success">success</option>
          <option value="pending_review">pending_review</option>
          <option value="error">error</option>
        </select>
        <div className="flex gap-2 lg:ml-auto">
          <Button variant={view === "table" ? "default" : "outline"} onClick={() => setView("table")}>Table</Button>
          <Button variant={view === "card" ? "default" : "outline"} onClick={() => setView("card")}>Card</Button>
          <Button variant="outline" onClick={() => download("csv")}>CSV</Button>
          <Button variant="outline" onClick={() => download("json")}>JSON</Button>
        </div>
      </div>

      {loading && <div className="glass-card p-6">Loading results…</div>}
      {!loading && items.length === 0 && <div className="glass-card p-6">No records found. Try adjusting filters.</div>}

      {!loading && items.length > 0 && view === "table" && (
        <div className="glass-card overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/30 text-left">
                <th className="p-3">Request</th>
                <th className="p-3">Student</th>
                <th className="p-3">Score</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Status</th>
                <th className="p-3">Review</th>
                {isStudent && <th className="p-3">Action</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.request_id} className="border-b last:border-0">
                  <td className="p-3 font-mono text-xs">{item.request_id}</td>
                  <td className="p-3">{item.student_id || "—"}</td>
                  <td className="p-3 font-semibold">{item.scores?.final_marks ?? 0}/{item.scores?.max_marks ?? 0}</td>
                  <td className="p-3">{Math.round((item.confidence || 0) * 100)}% ({confidenceLabel(item.confidence || 0)})</td>
                  <td className="p-3"><span className="px-2 py-1 rounded text-xs bg-secondary">{item.status}</span></td>
                  <td className="p-3">{item.manual_review_flag ? <span className="text-amber-600 font-medium">Manual</span> : <span className="text-emerald-600 font-medium">Auto</span>}</td>
                  {isStudent && (
                    <td className="p-3">
                      {item.mis_evaluation_reported ? (
                        <span className="text-xs text-amber-600 font-medium">Reported</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reportingId === item.request_id}
                          onClick={() => handleReport(item)}
                        >
                          {reportingId === item.request_id ? "Submitting..." : "Report"}
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && items.length > 0 && view === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.request_id} className="glass-card p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-mono truncate">{item.request_id}</p>
              <p className="font-heading font-bold">{item.scores?.final_marks ?? 0}/{item.scores?.max_marks ?? 0}</p>
              <p className="text-sm">Confidence: {Math.round((item.confidence || 0) * 100)}%</p>
              <p className="text-xs text-muted-foreground truncate">Student: {item.student_id || "—"}</p>
              <p className="text-xs"><span className="px-2 py-1 rounded bg-secondary">{item.status}</span></p>
              {isStudent && (
                item.mis_evaluation_reported ? (
                  <p className="text-xs text-amber-600 font-medium">Reported for manual review</p>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={reportingId === item.request_id}
                    onClick={() => handleReport(item)}
                  >
                    {reportingId === item.request_id ? "Submitting..." : "Report mis-evaluation"}
                  </Button>
                )
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages} · {total} records</p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
