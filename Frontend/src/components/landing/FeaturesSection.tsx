import { motion, type Variants } from "framer-motion";
import { Brain, Zap, Shield, BarChart3, Clock, Users } from "lucide-react";
import { useLandingTheme } from "@/contexts/LandingThemeContext";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: Brain,
    title: "AI-Powered OCR",
    description: "Advanced handwriting recognition with 99% accuracy using state-of-the-art deep learning models.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get comprehensive evaluation results in seconds, not hours. Process hundreds of scripts simultaneously.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Confidence Scoring",
    description: "Built-in confidence metrics flag uncertain evaluations for manual review, ensuring accuracy.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track performance trends, identify patterns, and gain insights with powerful analytics tools.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Clock,
    title: "Time Savings",
    description: "Reduce grading time by 95%, allowing educators to focus on teaching and student engagement.",
    color: "from-blue-600 to-indigo-600",
  },
  {
    icon: Users,
    title: "Batch Processing",
    description: "Handle multiple answer scripts in parallel with intelligent queue management and prioritization.",
    color: "from-indigo-500 to-blue-500",
  },
];

export default function FeaturesSection() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  return (
    <section id="features" className={`${isLight ? "bg-[#f7fbff]" : "bg-[#020b1d]"} py-20 sm:py-28`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
            className="text-center"
        >
          <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 ${isLight ? "border border-[#2EA3F2]/20 bg-white shadow-sm" : "border border-[#2EA3F2]/30 bg-[#2EA3F2]/10"}`}>
            <Zap className="h-4 w-4 text-[#2EA3F2]" />
            <span className="text-sm font-semibold text-[#2EA3F2]">Powerful Features</span>
          </div>
          <h2 className={`mb-4 text-4xl font-bold tracking-tight sm:text-5xl ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            Everything You Need for Modern Evaluation
          </h2>
          <p className={`mx-auto max-w-2xl text-lg ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            Comprehensive AI-powered tools designed to revolutionize academic assessment workflows.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${isLight ? "border border-blue-100 bg-white shadow-[0_12px_40px_rgba(30,64,175,0.08)]" : "border border-white/10 bg-[#0f1a32]/95 shadow-sm"}`}
            >
              <div className={`absolute right-0 top-0 h-24 w-24 bg-gradient-to-br opacity-0 blur-2xl transition-opacity group-hover:opacity-100 ${isLight ? "from-[#2EA3F2]/15 to-transparent" : "from-[#2EA3F2]/25 to-transparent"}`} />
              
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                <feature.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              
              <h3 className={`mb-3 text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>{feature.title}</h3>
              <p className={`leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
