import { motion, type Variants } from "framer-motion";
import { Award } from "lucide-react";
import { useLandingTheme } from "@/contexts/LandingThemeContext";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const accreditationLogos = [
  "NAAC A+.svg",
  "ARIIA.svg",
  "NIRF 70th Rank Band 101–150.svg",
  "C-GAUGE.svg",
  "NBA (National Board of Accreditation).svg",
  "AICTE (All India Council for Technical Education).svg",
  "Ministry of Education, Government of India.svg",
  "ISO 90012015 Certified.svg"
];

const MarqueeContent = () => (
  <div className="flex w-max items-center gap-12 pr-12 sm:gap-16 sm:pr-16">
    {accreditationLogos.map((logo, index) => (
      <img
        key={index}
        src={`/accreditations/${logo}`}
        alt={logo.replace(".svg", "")}
        className="h-20 w-auto max-w-none object-contain sm:h-24 md:h-28 lg:h-32 rounded-lg border border-slate-100 bg-white p-2 shadow-sm"
      />
    ))}
  </div>
);

export default function Accreditations() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  return (
    <section id="accreditation" className={`${isLight ? "bg-[#f7fbff]" : "bg-[#020b1d]"} py-16 sm:py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top: ABET section */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className={`mb-12 grid grid-cols-1 gap-8 rounded-2xl p-6 lg:grid-cols-2 lg:gap-12 lg:p-8 ${isLight ? "border border-blue-100 bg-white shadow-[0_12px_40px_rgba(30,64,175,0.08)]" : "border border-white/10 bg-gradient-to-br from-[#0f1a32] to-[#101b34] shadow-sm"}`}
        >
          {/* ABET logo */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className={`flex h-40 w-40 items-center justify-center rounded-full border-4 shadow-lg sm:h-48 sm:w-48 ${isLight ? "border-[#2EA3F2]/20 bg-[#eef5ff] shadow-[#2EA3F2]/10" : "border-[#2EA3F2]/25 bg-[#0b1429] shadow-[#2EA3F2]/10"}`}>
              <Award className="h-20 w-20 text-[#2EA3F2] sm:h-24 sm:w-24" />
              <span className="sr-only">ABET Logo</span>
            </div>
          </div>

          {/* Accreditation text */}
          <div className="flex flex-col justify-center">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#2EA3F2]">
              Accreditations
            </h3>
            <p className={`mb-2 text-lg font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              ABET (Accreditation Board for Engineering and Technology)
            </p>
            <p className={`leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              An ABET-accredited degree ensures programs meet the quality standards that produce
              graduates prepared to enter critical technical fields. These programs establish
              accreditations ensuring your degree is valued internationally and opens global
              opportunities by state-of-the-art facilities.
            </p>
          </div>
        </motion.div>

        {/* Bottom: Logo Slider */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className={`flex justify-center pt-10 ${isLight ? "border-t border-blue-100" : "border-t border-white/10"}`}
        >
          <div className="w-full overflow-hidden rounded-2xl bg-white py-6 shadow-sm sm:py-8">
            <div className="group relative flex overflow-hidden">
              <div className="flex w-max min-w-full animate-marquee hover:[animation-play-state:paused]">
                {/* We render the logo sequence twice to create a seamless infinite loop */}
                <MarqueeContent />
                <MarqueeContent />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
