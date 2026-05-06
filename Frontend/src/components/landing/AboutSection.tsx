import { motion, type Variants } from "framer-motion";
import { useLandingTheme } from "@/contexts/LandingThemeContext";
import idpImage from "../../../../IDP/2.svg";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function AboutSection() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  return (
    <section id="about" className={`relative overflow-hidden py-16 sm:py-20 lg:py-24 ${isLight ? "bg-[#f7fbff]" : "bg-[#020b1d]"}`}>
      <div className={`pointer-events-none absolute inset-0 ${isLight ? "opacity-30" : "opacity-40"}`}>
        <div className={`absolute -left-20 top-20 h-72 w-72 rounded-full blur-3xl ${isLight ? "bg-[#2EA3F2]/15" : "bg-[#2EA3F2]/20"}`} />
        <div className={`absolute -right-20 bottom-16 h-72 w-72 rounded-full blur-3xl ${isLight ? "bg-blue-200/40" : "bg-indigo-500/20"}`} />
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* Left: Glass content box */}
        <motion.article
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="order-2 lg:order-1"
        >
          <div className={`relative rounded-2xl p-8 shadow-[0_20px_60px_rgba(2,8,23,0.6)] backdrop-blur-md sm:p-10 ${isLight ? "border border-blue-100 bg-white" : "border border-white/10 bg-[#0f1a32]/95"}`}>
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#2EA3F2] to-sky-300" />
            {/* Small heading */}
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#2EA3F2]">
              About Us
            </p>

            {/* Main heading */}
            <h2 className={`mb-5 text-3xl font-bold tracking-tight sm:text-4xl ${isLight ? "text-[#1e3a8a]" : "text-[#ef4444]"}`}>
              VIGNAN Internal Evaluator
            </h2>

            {/* Description */}
            <p className={`leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              VIGNAN Internal Evaluator is an AI-driven platform that automates handwritten answer
              grading using advanced OCR, NLP, and confidence-based scoring. It helps educators
              evaluate faster, maintain consistency, and focus on meaningful academic insights while
              the system handles the heavy lifting.
            </p>
          </div>
        </motion.article>

        {/* Right: Image */}
        <motion.figure
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className={`group order-1 overflow-hidden rounded-2xl lg:order-2 ${isLight ? "border border-blue-100 shadow-[0_20px_55px_rgba(30,64,175,0.12)]" : "border border-white/10 shadow-[0_20px_55px_rgba(2,6,23,0.5)]"}`}
        >
              <img
                src={idpImage}
                alt="Student working on digital evaluation"
            className="h-full min-h-[320px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </motion.figure>
      </div>
    </section>
  );
}
