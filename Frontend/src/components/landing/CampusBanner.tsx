import { useLandingTheme } from "@/contexts/LandingThemeContext";

export default function CampusBanner() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  return (
    <section className="relative h-64 overflow-hidden bg-[url('/campus-banner.png')] bg-cover bg-center sm:h-80 lg:h-96">
      {/* Theme overlay */}
      <div className={`absolute inset-0 ${isLight ? "bg-[linear-gradient(135deg,rgba(247,251,255,0.35)_0%,rgba(255,255,255,0.18)_100%)]" : "bg-[linear-gradient(135deg,rgba(2,11,29,0.55)_0%,rgba(16,32,63,0.45)_100%)]"}`} />
    </section>
  );
}
