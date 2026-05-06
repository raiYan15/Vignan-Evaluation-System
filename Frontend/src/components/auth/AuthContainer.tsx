import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import TogglePanel from "@/components/auth/TogglePanel";

export type AuthMode = "login" | "signup";

type AuthContainerProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  children: ReactNode;
};

export default function AuthContainer({ mode, onModeChange, children }: AuthContainerProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 px-4 py-8 md:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mx-auto flex w-full max-w-5xl items-center justify-center"
      >
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/40 bg-white/75 shadow-xl backdrop-blur-xl md:min-h-[680px]">
          <div className="p-6 md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            className="absolute inset-y-0 left-0 z-30 hidden w-1/2 items-center justify-center p-10 md:flex"
            animate={{ x: mode === "login" ? "0%" : "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "login" ? -32 : 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "login" ? 32 : -32 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="w-full max-w-md"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="absolute inset-y-0 left-0 z-20 hidden w-1/2 items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-10 text-white md:flex"
            animate={{ x: mode === "login" ? "100%" : "0%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <TogglePanel mode={mode} onModeChange={onModeChange} />
          </motion.div>

          <div className="border-t border-white/30 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 text-white md:hidden">
            <TogglePanel mode={mode} onModeChange={onModeChange} compact />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
