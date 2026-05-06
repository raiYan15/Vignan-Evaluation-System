import { useLandingTheme } from "@/contexts/LandingThemeContext";

export default function TaglineStrip() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  return (
    <div className={`relative overflow-hidden py-6 sm:py-8 border-y ${isLight ? "border-blue-100 bg-gradient-to-r from-[#eef5ff] via-white to-[#eef5ff]" : "border-white/10 bg-gradient-to-r from-[#0b1429] via-[#10203f] to-[#0b1429]"}`}>
      <div className={`absolute inset-0 ${isLight ? "opacity-25" : "opacity-20"}`}>
        <div className={`absolute inset-0 ${isLight ? "bg-[radial-gradient(circle_at_20%_50%,_rgba(46,163,242,0.22)_0%,_transparent_45%)]" : "bg-[radial-gradient(circle_at_20%_50%,_white_0%,_transparent_45%)]"}`} />
      </div>
      <div className="relative mx-auto max-w-6xl px-4">
        <h2 className={`text-center text-2xl font-extrabold tracking-[0.02em] sm:text-3xl lg:text-4xl ${isLight ? "text-[#1e3a8a]" : "text-[#2EA3F2]"}`}>
          Smarter Evaluation for the Next Generation of Education
        </h2>
      </div>
    </div>
  );
}
