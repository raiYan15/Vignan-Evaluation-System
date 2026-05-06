import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import FacultyDashboard from "@/pages/FacultyDashboard";
import StudentDashboard from "@/pages/StudentDashboard";
import SingleEvaluation from "@/pages/SingleEvaluation";
import BatchEvaluation from "@/pages/BatchEvaluation";
import Results from "@/pages/Results";
import SelfResult from "@/pages/SelfResult";
import ClassResult from "@/pages/ClassResult";
import WebSearch from "@/pages/WebSearch";
import SystemStatus from "@/pages/SystemStatus";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicOnlyRoute from "@/components/auth/PublicOnlyRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />

              <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
              <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

              <Route path="/dashboard/faculty" element={<ProtectedRoute roles={["faculty", "admin"]}><FacultyDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/student" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />

              <Route path="/evaluate" element={<ProtectedRoute roles={["faculty", "admin"]}><SingleEvaluation /></ProtectedRoute>} />
              <Route path="/batch" element={<ProtectedRoute roles={["faculty", "admin"]}><BatchEvaluation /></ProtectedRoute>} />
              <Route path="/results" element={<ProtectedRoute roles={["faculty", "student", "admin"]}><Results /></ProtectedRoute>} />
              <Route path="/student/self-result" element={<ProtectedRoute roles={["student"]}><SelfResult /></ProtectedRoute>} />
              <Route path="/student/class-result" element={<ProtectedRoute roles={["student"]}><ClassResult /></ProtectedRoute>} />

              <Route path="/search" element={<ProtectedRoute roles={["faculty", "admin"]}><WebSearch /></ProtectedRoute>} />
              <Route path="/status" element={<ProtectedRoute roles={["faculty", "student", "admin"]}><SystemStatus /></ProtectedRoute>} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
