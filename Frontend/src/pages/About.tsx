import { motion } from "framer-motion";
import {
  Brain,
  Eye,
  MessageSquare,
  Target,
  Shield,
  ArrowRight,
  Cpu,
  Database,
  Globe,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const pipelineSteps = [
  { icon: Eye, title: "Image Upload", desc: "Handwritten answer images are captured and uploaded securely." },
  { icon: Brain, title: "OCR / HTR", desc: "Handwritten Text Recognition extracts text with confidence scoring." },
  { icon: MessageSquare, title: "NLP Scoring", desc: "Semantic analysis and keyword matching against rubric criteria." },
  { icon: Shield, title: "Confidence Routing", desc: "Low-confidence results are flagged for manual teacher review." },
  { icon: Target, title: "Final Marks", desc: "Composite score generated with detailed feedback and breakdown." },
];

const techStack = [
  { icon: Cpu, name: "FastAPI", desc: "Python backend with async support" },
  { icon: Brain, name: "TrOCR + NLP", desc: "ML models for recognition & scoring" },
  { icon: Database, name: "MongoDB", desc: "Document storage for evaluations" },
  { icon: Globe, name: "React + Vite", desc: "Modern, fast frontend application" },
];

const features = [
  "Drag & drop image upload with live preview",
  "Batch processing with parallel evaluation",
  "Animated confidence meters and scoring breakdowns",
  "Web search for reference answer comparison",
  "Manual review flagging for low-confidence results",
  "JSON/CSV export for batch results",
  "Real-time system health monitoring",
  "Responsive, teacher-friendly design",
];

export default function About() {
  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      <div className="page-header">
        <h1 className="page-title">About <span className="gradient-text">VIGNAN Evaluator</span></h1>
        <p className="page-subtitle max-w-2xl">
          An AI-powered platform for automated grading of handwritten answer scripts, combining OCR, NLP, and confidence-based routing.
        </p>
      </div>

      {/* Pipeline */}
      <motion.div variants={fadeUp} className="mb-10">
        <h2 className="font-heading text-xl font-semibold mb-5">Evaluation Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pipelineSteps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="glass-card p-4 h-full">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">0{i + 1}</span>
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
              {i < 4 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <motion.div variants={fadeUp} className="mb-10">
        <h2 className="font-heading text-xl font-semibold mb-5">Feature Highlights</h2>
        <div className="glass-card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-sm text-secondary-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div variants={fadeUp}>
        <h2 className="font-heading text-xl font-semibold mb-5">Tech Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techStack.map((tech) => (
            <div key={tech.name} className="glass-card p-4 text-center">
              <tech.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <h3 className="font-heading font-semibold text-sm">{tech.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{tech.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Confidence Routing Explanation */}
      <motion.div variants={fadeUp} className="mt-10">
        <h2 className="font-heading text-xl font-semibold mb-5">Confidence Routing</h2>
        <div className="glass-card p-6">
          <p className="text-sm text-secondary-foreground leading-relaxed mb-4">
            The system uses a multi-layer confidence assessment to ensure grading accuracy. Each answer goes through HTR confidence scoring, semantic similarity analysis, and keyword matching. When the composite confidence falls below the threshold, the result is automatically flagged for manual teacher review.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-2 rounded-lg bg-success/10 text-success text-xs font-semibold">≥ 80% → Auto-graded</div>
            <div className="px-3 py-2 rounded-lg bg-warning/10 text-warning text-xs font-semibold">50–80% → Review Suggested</div>
            <div className="px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">&lt; 50% → Manual Review</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
