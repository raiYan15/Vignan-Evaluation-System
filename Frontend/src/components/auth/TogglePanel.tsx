import { motion } from "framer-motion";
import type { AuthMode } from "@/components/auth/AuthContainer";

type TogglePanelProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  compact?: boolean;
};

export default function TogglePanel({ mode, onModeChange, compact = false }: TogglePanelProps) {
  const isLogin = mode === "login";

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
      <motion.h2
        key={isLogin ? "hello" : "back"}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={compact ? "text-2xl font-bold" : "text-4xl font-bold"}
      >
        {isLogin ? "Hello, Welcome!" : "Welcome Back!"}
      </motion.h2>
      <p className={compact ? "mt-2 text-sm text-white/90" : "mt-3 text-base text-white/90"}>
        {isLogin ? "Enter your details to start your dashboard" : "Already have an account? Sign in to continue."}
      </p>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onModeChange(isLogin ? "signup" : "login")}
        className="mt-7 rounded-full border border-white/75 px-8 py-2.5 text-sm font-semibold uppercase tracking-wide transition hover:bg-white hover:text-blue-700"
      >
        {isLogin ? "Sign Up" : "Sign In"}
      </motion.button>
    </div>
  );
}
