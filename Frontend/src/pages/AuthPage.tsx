import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError, type FacultyRegisterPayload, type StudentRegisterPayload } from "@/api/api";
import AuthContainer, { type AuthMode } from "@/components/auth/AuthContainer";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type AuthPageProps = {
  initialMode?: AuthMode;
};

export default function AuthPage({ initialMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const { login, registerFaculty, registerStudent } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginLoading(true);
    try {
      const auth = await login(email, password);
      toast({ title: "Welcome back", description: `${auth.user.name} signed in successfully.` });
      const from = (location.state as { from?: string } | null)?.from;
      if (from) {
        navigate(from);
      } else {
        navigate(auth.user.role === "faculty" ? "/dashboard/faculty" : "/dashboard/student");
      }
    } catch (err) {
      toast({
        title: "Login failed",
        description: err instanceof ApiError ? err.detail : "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleFacultySignup = async (payload: FacultyRegisterPayload) => {
    setSignupLoading(true);
    try {
      const auth = await registerFaculty(payload);
      toast({ title: "Faculty account created", description: `Welcome ${auth.user.name}` });
      navigate("/dashboard/faculty");
    } catch (err) {
      toast({
        title: "Registration failed",
        description: err instanceof ApiError ? err.detail : "Please retry.",
        variant: "destructive",
      });
    } finally {
      setSignupLoading(false);
    }
  };

  const handleStudentSignup = async (payload: StudentRegisterPayload) => {
    setSignupLoading(true);
    try {
      const auth = await registerStudent(payload);
      toast({ title: "Student account created", description: `Welcome ${auth.user.name}` });
      navigate("/dashboard/student");
    } catch (err) {
      toast({
        title: "Registration failed",
        description: err instanceof ApiError ? err.detail : "Please retry.",
        variant: "destructive",
      });
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <AuthContainer mode={mode} onModeChange={setMode}>
      {mode === "login" ? (
        <LoginForm
          email={email}
          password={password}
          loading={loginLoading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleLogin}
          onSwitchToSignup={() => setMode("signup")}
        />
      ) : (
        <SignupForm
          loading={signupLoading}
          onSubmitFaculty={handleFacultySignup}
          onSubmitStudent={handleStudentSignup}
          onSwitchToLogin={() => setMode("login")}
        />
      )}
    </AuthContainer>
  );
}
