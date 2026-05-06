import { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import type { FacultyRegisterPayload, StudentRegisterPayload } from "@/api/api";
import InstitutionLogo from "@/components/auth/InstitutionLogo";

type SignupRole = "faculty" | "student";

type SignupFormProps = {
  loading: boolean;
  onSubmitFaculty: (payload: FacultyRegisterPayload, profilePic: string | null) => Promise<void>;
  onSubmitStudent: (payload: StudentRegisterPayload, profilePic: string | null) => Promise<void>;
  onSwitchToLogin: () => void;
};

function FormInput({
  id,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  id: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
      className="w-full h-12 px-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition duration-200"
    />
  );
}

export default function SignupForm({ loading, onSubmitFaculty, onSubmitStudent, onSwitchToLogin }: SignupFormProps) {
  const [role, setRole] = useState<SignupRole>("student");
  const [faculty, setFaculty] = useState<FacultyRegisterPayload>({
    name: "",
    faculty_id: "",
    email: "",
    department: "",
    password: "",
  });
  const [student, setStudent] = useState<StudentRegisterPayload>({
    name: "",
    roll_number: "",
    email: "",
    branch: "",
    section: "",
    password: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (role === "faculty") {
      await onSubmitFaculty(faculty, null);
      return;
    }
    await onSubmitStudent(student, null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <InstitutionLogo />
        <h1 className="text-4xl font-bold text-slate-900">Sign Up</h1>
        <p className="mt-2 text-sm text-slate-500">Create your account to access the dashboard</p>
      </div>

      <div className="rounded-full border border-slate-200 bg-slate-50 p-1 shadow-inner">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setRole("faculty")}
            className={`h-10 rounded-full text-sm font-medium transition ${role === "faculty" ? "bg-white text-blue-700 shadow" : "text-slate-500 hover:text-slate-700"}`}
          >
            Faculty
          </button>
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`h-10 rounded-full text-sm font-medium transition ${role === "student" ? "bg-white text-blue-700 shadow" : "text-slate-500 hover:text-slate-700"}`}
          >
            Student
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Professional onboarding</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Create your verified academic profile to access evaluation, results, and reporting features.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <BadgeCheck className="h-3.5 w-3.5" /> Secure access
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Faculty & student roles
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {role === "faculty" ? (
          <>
            <FormInput id="faculty-name" placeholder="Name" value={faculty.name} onChange={(value) => setFaculty({ ...faculty, name: value })} />
            <FormInput id="faculty-id" placeholder="Faculty ID" value={faculty.faculty_id} onChange={(value) => setFaculty({ ...faculty, faculty_id: value })} />
            <FormInput id="faculty-email" placeholder="Email" type="email" value={faculty.email} onChange={(value) => setFaculty({ ...faculty, email: value })} />
            <FormInput id="faculty-department" placeholder="Department" value={faculty.department} onChange={(value) => setFaculty({ ...faculty, department: value })} />
            <div className="md:col-span-2">
              <FormInput id="faculty-password" placeholder="Password" type="password" value={faculty.password} onChange={(value) => setFaculty({ ...faculty, password: value })} />
            </div>
          </>
        ) : (
          <>
            <FormInput id="student-name" placeholder="Name" value={student.name} onChange={(value) => setStudent({ ...student, name: value })} />
            <FormInput id="student-roll" placeholder="Roll Number" value={student.roll_number} onChange={(value) => setStudent({ ...student, roll_number: value })} />
            <FormInput id="student-email" placeholder="Email" type="email" value={student.email} onChange={(value) => setStudent({ ...student, email: value })} />
            <FormInput id="student-branch" placeholder="Branch" value={student.branch} onChange={(value) => setStudent({ ...student, branch: value })} />
            <FormInput id="student-section" placeholder="Section" value={student.section} onChange={(value) => setStudent({ ...student, section: value })} />
            <FormInput id="student-password" placeholder="Password" type="password" value={student.password} onChange={(value) => setStudent({ ...student, password: value })} />
          </>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="h-11 w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-blue-400/30 transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating account…" : role === "faculty" ? "Register Faculty" : "Register Student"}
      </motion.button>

      <p className="text-center text-sm text-slate-500 md:hidden">
        Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin} className="font-semibold text-blue-700">
          Sign In
        </button>
      </p>
    </form>
  );
}
