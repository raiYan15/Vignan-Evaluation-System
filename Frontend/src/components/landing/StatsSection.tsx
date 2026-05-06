import { motion, type Variants } from "framer-motion";
import { TrendingUp, Users, FileCheck, Award } from "lucide-react";
import { useLandingTheme } from "@/contexts/LandingThemeContext";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stats = [
  {
    icon: TrendingUp,
    value: "95%",
    label: "Faster Grading",
    description: "Reduce evaluation time dramatically",
  },
  {
    icon: Users,
    value: "500+",
    label: "Active Educators",
    description: "Trusted by faculty nationwide",
  },
  {
    icon: FileCheck,
    value: "50K+",
    label: "Scripts Evaluated",
    description: "And counting every day",
  },
  {
    icon: Award,
    value: "99%",
    label: "Accuracy Rate",
    description: "AI precision you can trust",
  },
];

export default function StatsSection() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  return (
    <section className={`relative overflow-hidden py-20 sm:py-28 ${isLight ? "bg-[#eef5ff]" : "bg-gradient-to-br from-[#1e3a8a] to-[#2563eb]"}`}>
      {/* Background pattern */}
      <div className={`absolute inset-0 ${isLight ? "opacity-20" : "opacity-10"}`}>
        <div className={`absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl ${isLight ? "bg-white/80" : "bg-white"}`} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="mb-16 text-center"
        >
          <h2 className={`mb-4 text-4xl font-bold tracking-tight sm:text-5xl ${isLight ? "text-slate-900" : "text-white"}`}>
            Trusted by Educators Everywhere
          </h2>
          <p className={`mx-auto max-w-2xl text-lg ${isLight ? "text-slate-600" : "text-blue-100"}`}>
            Join hundreds of institutions leveraging AI to transform their evaluation process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl p-8 text-center backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg ${isLight ? "border border-blue-100 bg-white shadow-[0_12px_40px_rgba(30,64,175,0.08)]" : "border border-white/20 bg-white/10 hover:bg-white/15"}`}
            >
              <div className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${isLight ? "bg-[#2EA3F2]/10" : "bg-white/20"}`}>
                <stat.icon className={`h-8 w-8 ${isLight ? "text-[#2EA3F2]" : "text-white"}`} strokeWidth={2.5} />
              </div>
              <div className={`mb-2 text-5xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{stat.value}</div>
              <div className={`mb-2 text-xl font-semibold ${isLight ? "text-slate-700" : "text-blue-100"}`}>{stat.label}</div>
              <div className={`text-sm ${isLight ? "text-slate-500" : "text-blue-200"}`}>{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
