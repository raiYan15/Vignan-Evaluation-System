import HeroSection from "@/components/landing/HeroSection";
import TaglineStrip from "@/components/landing/TaglineStrip";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StatsSection from "@/components/landing/StatsSection";
import AboutSection from "@/components/landing/AboutSection";
import CampusBanner from "@/components/landing/CampusBanner";
import Accreditations from "@/components/landing/Accreditations";
import Footer from "@/components/landing/Footer";
import { LandingThemeProvider } from "@/contexts/LandingThemeContext";

export default function Dashboard() {
  return (
    <LandingThemeProvider>
      <div className="overflow-hidden">
        <HeroSection />
        <TaglineStrip />
        <FeaturesSection />
        <StatsSection />
        <AboutSection />
        <CampusBanner />
        <Accreditations />
        <Footer />
      </div>
    </LandingThemeProvider>
  );
}
