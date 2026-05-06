import { motion } from "framer-motion";
import { useState } from "react";

type InstitutionLogoProps = {
  className?: string;
};

export default function InstitutionLogo({ className = "" }: InstitutionLogoProps) {
  const [src, setSrc] = useState("/university-logo.jpg");

  const handleImageError = () => {
    setSrc((prev) => {
      if (prev === "/university-logo.jpg") return "/logo2.png";
      if (prev === "/logo2.png") return "/logo.png";
      if (prev === "/logo.png") return "/logo.jpg";
      return "/placeholder.svg";
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: [0, -3, 0] }}
      transition={{
        opacity: { duration: 0.45, ease: "easeOut" },
        y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
      }}
      className={`mb-5 flex items-center justify-center ${className}`}
    >
      <div className="rounded-2xl bg-white/60 p-2 shadow-md shadow-blue-100/70 ring-1 ring-white/70">
        <img
          src={src}
          alt="Institution Logo"
          loading="eager"
          onError={handleImageError}
          className="h-12 w-auto object-contain transition-transform duration-300 hover:scale-105 sm:h-14 md:h-16 lg:h-20"
        />
      </div>
    </motion.div>
  );
}
