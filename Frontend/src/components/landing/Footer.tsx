import { Mail, MapPin, Phone, Award } from "lucide-react";
import { useLandingTheme } from "@/contexts/LandingThemeContext";

export default function Footer() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  return (
    <footer id="contact" className={`relative overflow-hidden py-12 ${isLight ? "bg-[#eef5ff] text-slate-900" : "bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 text-white"}`}>
      <div className={`pointer-events-none absolute inset-0 ${isLight ? "opacity-35" : "opacity-20"}`}>
        <div className={`absolute -top-16 left-1/3 h-44 w-44 rounded-full blur-3xl ${isLight ? "bg-[#2EA3F2]/15" : "bg-blue-200"}`} />
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {/* Contact Us */}
        <section>
          <h2 className={`mb-4 text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : ""}`}>Contact Us</h2>
          <address className={`not-italic text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-white/90"}`}>
            <p className="mb-3 flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Vignan's Foundation for Science, Technology and Research
                <br />
                Vadlamudi, Guntur District
                <br />
                Andhra Pradesh - 522213
              </span>
            </p>
            <p className="mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              info@vignan.ac.in
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              +91 863 2344 700 / 701
            </p>
          </address>
        </section>

        {/* IAO Badge section */}
        <section className="md:col-span-2 lg:col-span-2">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 shadow-lg ${isLight ? "border-[#2EA3F2]/15 bg-white" : "border-white/20 bg-white/10"}`}>
              <Award className={`h-12 w-12 ${isLight ? "text-[#2EA3F2]" : "text-white"}`} />
            </div>
            <div>
              <h3 className={`mb-2 text-lg font-bold ${isLight ? "text-slate-900" : ""}`}>International Accreditation Organization</h3>
              <p className={`text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-white/90"}`}>
                Vignan's Foundation for Science, Technology and Research (Vignan) met the
                accreditation requirements of the International Accreditation Organization (IAO) and
                was granted full accreditation status effective from the date of approval.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Copyright */}
      <div className={`mx-auto mt-8 max-w-7xl border-t px-4 pt-6 text-center text-sm ${isLight ? "border-blue-100 text-slate-500" : "border-white/20 text-white/80"}`}>
        <p>© {new Date().getFullYear()} Vignan's Foundation for Science, Technology and Research. All rights reserved.</p>
      </div>
    </footer>
  );
}
