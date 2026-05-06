import { Chrome, Facebook, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import InstitutionLogo from "@/components/auth/InstitutionLogo";

type LoginFormProps = {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSwitchToSignup: () => void;
};

function FormInput({
  id,
  placeholder,
  type,
  value,
  onChange,
  required = true,
}: {
  id: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full h-12 px-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition duration-200"
    />
  );
}

const socialButtons = [
  { label: "Facebook", icon: Facebook },
  { label: "Google", icon: Chrome },
  { label: "LinkedIn", icon: Linkedin },
];

export default function LoginForm({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onSwitchToSignup,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="text-center">
        <InstitutionLogo />
        <h1 className="text-4xl font-bold text-slate-900">Sign In</h1>
        <div className="mt-5 flex items-center justify-center gap-3">
          {socialButtons.map(({ label, icon: Icon }) => (
            <motion.button
              key={label}
              type="button"
              whileHover={{ y: -2, scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:text-blue-600"
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </motion.button>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">or use your account</p>
      </div>

      <FormInput id="login-email" placeholder="Email" type="email" value={email} onChange={onEmailChange} />
      <FormInput id="login-password" placeholder="Password" type="password" value={password} onChange={onPasswordChange} />

      <div className="text-right">
        <button type="button" className="text-sm text-slate-500 transition hover:text-blue-600">
          Forgot your password?
        </button>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="h-11 w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-blue-400/30 transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign In"}
      </motion.button>

      <p className="text-center text-sm text-slate-500 md:hidden">
        New here?{" "}
        <button type="button" onClick={onSwitchToSignup} className="font-semibold text-blue-700">
          Sign Up
        </button>
      </p>
    </form>
  );
}
