import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Activity,
  Database,
  Cpu,
  Server,
  RefreshCw,
} from "lucide-react";
import { getHealth, type HealthStatus } from "@/api/api";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function StatusBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="flex items-center gap-1.5 text-success text-sm font-medium">
      <CheckCircle2 className="w-4 h-4" /> Operational
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-destructive text-sm font-medium">
      <XCircle className="w-4 h-4" /> Down
    </span>
  );
}

export default function SystemStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState<number | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(false);
    const start = Date.now();
    try {
      const res = await getHealth();
      setLatency(Date.now() - start);
      setHealth(res);
    } catch {
      setError(true);
      setLatency(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHealth(); }, []);

  const isOnline = !error && health?.api_status === "ready";

  const items = [
    { label: "Backend API", icon: Server, ok: isOnline, detail: latency ? `${latency}ms` : "—" },
    { label: "MongoDB", icon: Database, ok: health?.mongo_status === "up", detail: health?.mongo_status || "—" },
    { label: "Gemini", icon: Activity, ok: Boolean(health?.gemini_enabled), detail: health?.gemini_enabled ? "enabled" : "disabled" },
    { label: "Device", icon: Cpu, ok: true, detail: health?.cuda_available ? "cuda" : "cpu" },
    { label: "Engine Mode", icon: Activity, ok: true, detail: health?.engine_mode || "—" },
  ];

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">System Status</h1>
          <p className="page-subtitle">Backend health and service monitoring</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <motion.div {...fadeUp} className={`glass-card p-6 mb-6 ${isOnline ? "border-success/20" : "border-destructive/20"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Overall Status</p>
            <p className={`text-2xl font-heading font-bold ${isOnline ? "text-success" : "text-destructive"}`}>
              {loading ? "Checking…" : isOnline ? "All Systems Operational" : "Service Disruption"}
            </p>
          </div>
          <div className={`w-4 h-4 rounded-full ${isOnline ? "bg-success animate-pulse-glow" : "bg-destructive"}`} />
        </div>
      </motion.div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="font-heading font-semibold text-sm">{item.label}</span>
              </div>
              <StatusBadge ok={item.ok} />
            </div>
            <p className="text-sm text-muted-foreground capitalize">{item.detail}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
