import { useState } from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Search,
  Activity,
  Info,
  Menu,
  X,
  Brain,
  LogOut,
  BookOpen,
  UploadCloud,
  Sparkles,
  LineChart,
  CalendarCheck,
  Bell,
  Settings,
  FileCheck,
  ClipboardList,
  Users,
  FileBarChart,
  Lightbulb,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const publicItems = [
  { title: "About", path: "/about", icon: Info },
];

const facultyItems = [
  { title: "Dashboard", path: "/dashboard/faculty", icon: LayoutDashboard },
  { title: "Single Evaluation", path: "/evaluate", icon: FileCheck },
  { title: "Batch Evaluation", path: "/batch", icon: Layers },
  { title: "Results", path: "/results", icon: ClipboardList },
  { title: "Search Scripts", path: "/search", icon: Search },
  { title: "Student Analytics", path: "/analytics", icon: Users },
  { title: "Reports", path: "/reports", icon: FileBarChart },
  { title: "AI Insights", path: "/insights", icon: Lightbulb },
  { title: "Settings", path: "/settings", icon: Settings },
];

const studentItems = [
  { title: "Dashboard", path: "/dashboard/student", icon: LayoutDashboard },
  { title: "My Exams", path: "/student/exams", icon: BookOpen },
  { title: "Upload Answer Sheet", path: "/student/upload", icon: UploadCloud },
  { title: "AI Results", path: "/student/self-result", icon: Sparkles },
  { title: "Performance Analytics", path: "/student/analytics", icon: LineChart },
  { title: "Attendance", path: "/student/attendance", icon: CalendarCheck },
  { title: "Notifications", path: "/student/notifications", icon: Bell },
  { title: "Settings", path: "/student/settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isPublicPage = ["/", "/login", "/register"].includes(location.pathname);

  const navItems = user?.role === "student" ? studentItems : user?.role === "faculty" || user?.role === "admin" ? facultyItems : publicItems;

  if (isPublicPage) {
    return (
      <main className="min-h-screen w-full bg-[#f7fbff] text-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed z-50 md:sticky top-0 h-screen flex flex-col border-r border-border/50 bg-sidebar transition-transform duration-300 w-64 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-border/30">
          <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg bg-white p-1 shadow-sm">
            <img src="/LOGO.svg" alt="Vignan Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="font-heading text-base font-bold text-foreground tracking-tight">VIGNAN</h1>
            <p className="text-[11px] text-muted-foreground leading-tight">Internal Evaluator</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
            title="Close navigation menu"
            className="ml-auto md:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Section */}
        {isAuthenticated && user && (
          <div className="px-5 py-5 border-b border-border/30 bg-black/10">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center font-bold text-primary border border-primary/30 shadow-[0_0_15px_rgba(46,163,242,0.15)] overflow-hidden">
                {user.role === 'student' ? (
                  <img src={localStorage.getItem("vignan_profile_pic") || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop"} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <img src={localStorage.getItem("vignan_profile_pic") || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"} alt="Profile" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground truncate tracking-tight">
                  {user.name || (user.role === 'student' ? 'Student' : 'Faculty')}
                </p>
                <p className="text-xs text-muted-foreground truncate font-medium">
                  {user.role === 'student' ? `${user.branch || 'B.Tech'} - ${user.section || 'CSE (A)'}` : user.department || 'Department of CSE'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <RouterNavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span>{item.title}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </RouterNavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border/30">
          {isAuthenticated && (
            <button
              onClick={logout}
              className="w-full mb-3 inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary/50"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          )}
          <p className="text-[11px] text-muted-foreground text-center">
            AI-Powered Grading v1.0
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-background/80 backdrop-blur-lg md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            title="Open navigation menu"
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white p-0.5 shadow-sm">
              <img src="/LOGO.svg" alt="Vignan Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-heading text-sm font-semibold">VIGNAN Evaluator</span>
          </div>
        </header>

        <main className="page-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
