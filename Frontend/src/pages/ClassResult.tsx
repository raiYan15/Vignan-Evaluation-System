import { useEffect, useState } from "react";
import { getClassSummary, type ClassSummary, ApiError } from "@/api/api";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

export default function ClassResult() {
  const [summary, setSummary] = useState<ClassSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getClassSummary();
        if (active) setSummary(data);
      } catch (err) {
        toast({ title: "Unable to load class results", description: err instanceof ApiError ? err.detail : "Please try again.", variant: "destructive" });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [toast]);

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">Class Result</h1>
        <p className="page-subtitle">Class performance, averages, rank, and comparison insights</p>
      </div>

      {loading && <div className="glass-card p-6">Loading class analytics…</div>}

      {!loading && summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4"><p className="text-xs text-muted-foreground">Branch/Section</p><p className="font-heading font-bold">{summary.branch} - {summary.section}</p></div>
            <div className="glass-card p-4"><p className="text-xs text-muted-foreground">Class Average</p><p className="font-heading font-bold">{summary.average}</p></div>
            <div className="glass-card p-4"><p className="text-xs text-muted-foreground">Your Rank</p><p className="font-heading font-bold">{summary.my_rank ?? "N/A"}</p></div>
          </div>

          <div className="glass-card p-5">
            <p className="font-heading font-semibold mb-3">Top 10 Students by Average Score</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.students.slice(0, 10)}>
                  <XAxis dataKey="student_id" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average_score" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/results?scope=class" className="text-sm text-primary font-medium">Open professional batch results view →</Link>
          </div>
        </>
      )}
    </div>
  );
}
