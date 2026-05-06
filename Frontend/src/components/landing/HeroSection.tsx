import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, TrendingUp, Zap, Shield } from "lucide-react";
import Navbar from "./Navbar";
import { useLandingTheme } from "@/contexts/LandingThemeContext";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.1 } },
};

const stats = [
  { icon: TrendingUp, label: "95% Faster", sublabel: "Grading Speed" },
  { icon: Zap, label: "99% Accurate", sublabel: "AI Precision" },
  { icon: Shield, label: "100% Secure", sublabel: "Data Protected" },
];

export default function HeroSection() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  return (
    <section
      className={`relative min-h-screen overflow-hidden ${
        isLight
          ? "bg-[#2563eb]"
          : "bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6]"
      }`}
    >
      {/* Animated background pattern */}
      <div className={`absolute inset-0 ${isLight ? "opacity-30" : "opacity-20"}`}>
        <div className={`absolute left-1/4 top-1/4 h-96 w-96 rounded-full blur-3xl ${isLight ? "bg-[#2EA3F2]/15" : "bg-white/30"}`} />
        <div className={`absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full blur-3xl ${isLight ? "bg-blue-200/50" : "bg-[#2EA3F2]/40"}`} />
      </div>

      {/* Grid pattern overlay */}
      <div className={`absolute inset-0 ${isLight ? "opacity-20" : "opacity-10"} hero-grid-overlay`} />

      <Navbar />

      <div className="relative mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="grid min-h-screen grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          {/* Left: Content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <motion.div variants={fadeIn} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-sm ${isLight ? "border border-[#2EA3F2]/20 bg-white/80 shadow-sm" : "border border-white/20 bg-white/10"}`}>
              <Sparkles className={`h-4 w-4 ${isLight ? "text-[#2EA3F2]" : "text-cyan-200"}`} />
              <span className={`text-sm font-semibold ${isLight ? "text-slate-700" : "text-white"}`}>AI-Powered Academic Excellence</span>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              Smarter Evaluation for the{" "}
              <span className={`bg-clip-text text-transparent ${isLight ? "bg-gradient-to-r from-blue-100 to-white" : "bg-gradient-to-r from-cyan-200 to-blue-200"}`}>
                Next Generation
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className={`text-lg leading-relaxed sm:text-xl ${isLight ? "text-blue-50" : "text-blue-100"}`}>
              VIGNAN Internal Evaluator transforms handwritten answer assessment with AI-driven OCR,
              NLP scoring, and confidence-based routing for faster, consistent, and reliable evaluations.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className={`group inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold shadow-xl transition-all hover:scale-105 hover:shadow-2xl ${isLight ? "bg-[#2EA3F2] text-white hover:bg-[#1e8fcf]" : "bg-white text-[#2EA3F2]"}`}
              >
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className={`inline-flex items-center gap-2 rounded-xl border-2 px-8 py-4 text-base font-semibold backdrop-blur-sm transition-all ${isLight ? "border-[#2EA3F2]/20 bg-white text-slate-700 shadow-sm hover:border-[#2EA3F2]/35 hover:text-[#2EA3F2]" : "border-white/30 bg-white/10 text-white hover:bg-white/20"}`}
              >
                Login
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeIn} className="grid grid-cols-3 gap-4 pt-8">
              {stats.map((stat) => (
                <div key={stat.label} className={`rounded-xl p-4 backdrop-blur-sm ${isLight ? "border border-blue-100 bg-white shadow-sm" : "border border-white/20 bg-white/10"}`}>
                  <stat.icon className={`mb-2 h-6 w-6 ${isLight ? "text-[#2EA3F2]" : "text-cyan-200"}`} />
                  <p className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{stat.label}</p>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-200"}`}>{stat.sublabel}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Floating Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className={`absolute -inset-4 rounded-3xl blur-2xl ${isLight ? "bg-gradient-to-r from-[#2EA3F2]/10 to-blue-200/30" : "bg-gradient-to-r from-cyan-400/20 to-blue-400/20"}`} />
            <div className={`relative overflow-hidden rounded-2xl p-8 shadow-2xl backdrop-blur-xl ${isLight ? "border border-blue-100 bg-white/95" : "border border-white/20 bg-white/95"}`}>
              <div className={`absolute right-0 top-0 h-40 w-40 ${isLight ? "bg-gradient-to-br from-[#2EA3F2]/10 to-transparent" : "bg-gradient-to-br from-[#2EA3F2]/20 to-transparent"}`} />
              
              <div className="relative space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2EA3F2] to-[#1e8fcf] shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Online Evaluator</h3>
                    <p className="text-sm text-gray-600">Start your AI journey</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    "Upload answer scripts instantly",
                    "AI-powered OCR & NLP analysis",
                    "Get reliable marks in seconds",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                          <div className="h-2 w-2 rounded-full bg-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/register"
                  className="group block w-full rounded-xl bg-gradient-to-r from-[#2EA3F2] to-[#1e8fcf] px-6 py-4 text-center text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  Select Role & Start
                  <ArrowRight className="ml-2 inline-block h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
