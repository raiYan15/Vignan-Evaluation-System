import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return <>{children}</>;

  if (isAuthenticated && user) {
    return <Navigate to={user.role === "faculty" ? "/dashboard/faculty" : "/dashboard/student"} replace />;
  }

  return <>{children}</>;
}
