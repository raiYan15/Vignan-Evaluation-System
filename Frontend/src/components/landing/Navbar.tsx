import { useState, useEffect } from "react";
import { Menu, X, SunMedium, MoonStar } from "lucide-react";
import { Link } from "react-router-dom";
import { useLandingTheme } from "@/contexts/LandingThemeContext";



const navLinks = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Accreditation", href: "#accreditation" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useLandingTheme();
  const isLight = theme === "light";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isLight
            ? scrolled
              ? "border-b border-slate-200 bg-white shadow-lg shadow-black/5"
              : "bg-white shadow-sm"
            : scrolled
              ? "border-b border-white/10 bg-[#0b1429]/95 shadow-lg shadow-black/20 backdrop-blur-xl"
              : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
              <img
                src="/LOGO.svg"
                alt="Vignan logo"
                className="h-12 w-auto sm:h-14"
              />
              <div>
                <p className={`text-sm font-bold leading-tight ${
                  isLight ? "text-slate-900" : scrolled ? "text-slate-100" : "text-white"
                }`}>VIGNAN Evaluator</p>
                <p className={`text-[10px] leading-tight ${
                  isLight ? "text-slate-500" : scrolled ? "text-slate-300" : "text-white/80"
                }`}>AI-Powered Assessment</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isLight
                      ? "text-slate-600 hover:text-[#2EA3F2]"
                      : scrolled
                        ? "text-slate-200 hover:text-[#2EA3F2]"
                        : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                  isLight
                    ? "border-blue-100 bg-white text-slate-700 shadow-sm hover:border-[#2EA3F2]/30 hover:text-[#2EA3F2]"
                    : "border-white/15 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                }`}
                aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
                title={`Switch to ${isLight ? "dark" : "light"} theme`}
              >
                {isLight ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                {isLight ? "Dark" : "Light"}
              </button>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-[#2EA3F2] to-[#1e8fcf] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#2EA3F2]/25 transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#2EA3F2]/30"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden ${
                isLight ? "text-gray-900" : scrolled ? "text-gray-900" : "text-white"
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`${isLight ? "border-t border-blue-100 bg-white" : "border-t border-white/10 bg-[#0b1429]"} md:hidden`}>
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium ${isLight ? "text-slate-600 hover:bg-slate-50" : "text-slate-200 hover:bg-white/5"}`}
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={toggleTheme}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${isLight ? "border border-blue-100 bg-white text-slate-700" : "border border-white/10 bg-white/10 text-white"}`}
              >
                {isLight ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                {isLight ? "Dark theme" : "Light theme"}
              </button>
              <Link
                to="/register"
                className="mt-2 block rounded-lg bg-gradient-to-r from-[#2EA3F2] to-[#1e8fcf] px-3 py-2 text-center text-sm font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>


    </>
  );
}
