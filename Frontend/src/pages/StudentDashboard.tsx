import { Link } from "react-router-dom";
import { 
  BookOpen, UploadCloud, Sparkles, LineChart, CalendarCheck, 
  Trophy, Bell, ChevronRight, BrainCircuit, Activity,
  Clock, CheckCircle, AlertTriangle, FileText, ArrowRight, Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";
import { LandingThemeProvider, useLandingTheme } from "@/contexts/LandingThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const marksData = [
  { name: 'Mid 1', score: 65 },
  { name: 'Quiz 1', score: 78 },
  { name: 'Mid 2', score: 72 },
  { name: 'Quiz 2', score: 85 },
  { name: 'Final', score: 88 },
];

const subjectData = [
  { name: 'DBMS', value: 85 },
  { name: 'OS', value: 72 },
  { name: 'DAA', value: 90 },
  { name: 'CN', value: 68 },
];

const COLORS = ['#2EA3F2', '#00C49F', '#FFBB28', '#FF8042'];

const stats = [
  { title: "Upcoming Exams", value: "2", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "Pending Submissions", value: "1", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  { title: "Average Score", value: "78%", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { title: "AI Rank in Class", value: "12th", icon: Trophy, color: "text-purple-500", bg: "bg-purple-500/10" },
  { title: "Attendance", value: "92%", icon: CalendarCheck, color: "text-rose-500", bg: "bg-rose-500/10" },
];

const recentResults = [
  { subject: "Database Management Systems", date: "Oct 12, 2026", score: 85, feedback: "Excellent ER diagram structure. Review normalization concepts." },
  { subject: "Operating Systems", date: "Oct 10, 2026", score: 72, feedback: "Good understanding of scheduling, but weak in page replacement algorithms." },
  { subject: "Design & Analysis of Algo", date: "Oct 05, 2026", score: 90, feedback: "Perfect dynamic programming solutions. Highly optimized." },
];

function StudentDashboardContent() {
  const { theme } = useLandingTheme();
  const { user } = useAuth();
  const isLight = theme === "light";

  return (
    <div className={`min-h-[calc(100vh-4rem)] -m-6 md:-m-8 p-6 md:p-8 lg:p-10 ${isLight ? "bg-[#f8faff]" : "bg-[#0B1121]"}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 ${isLight ? "bg-gradient-to-r from-[#002a5c] to-[#004a99] text-white" : "bg-gradient-to-r from-[#0B1830] to-[#12284C] border border-blue-900/30 text-white shadow-xl shadow-blue-900/10"}`}
        >
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none mix-blend-overlay">
            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2000&auto=format&fit=crop" alt="University Campus" className="w-full h-full object-cover" style={{ maskImage: 'linear-gradient(to right, transparent, black)' }} />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-semibold text-blue-50 uppercase tracking-wider">Fall Semester 2026</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
              Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">{user?.name || "Student"} 👋</span>
            </h1>
            <p className="text-lg text-blue-100/90 max-w-xl leading-relaxed">
              "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/student/upload" className="inline-flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                <UploadCloud className="w-5 h-5" />
                Upload Answer Sheet
              </Link>
              <Link to="/student/self-result" className="inline-flex items-center gap-2 bg-blue-800/50 backdrop-blur-sm border border-blue-400/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800/70 transition-colors">
                <BrainCircuit className="w-5 h-5" />
                View AI Results
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-5 rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.03] hover:shadow-lg ${isLight ? "bg-white border-slate-100 shadow-sm hover:border-blue-200" : "bg-[#111A31]/80 border-slate-800 hover:border-blue-800"}`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>{stat.title}</p>
                <p className={`text-2xl font-bold mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Middle Section: Charts & Recent Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Charts + Results) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-2xl border ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#111A31]/80 border-slate-800 shadow-md"}`}
              >
                <h3 className={`text-lg font-bold mb-6 ${isLight ? "text-slate-900" : "text-white"}`}>Marks Progression</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={marksData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#1e293b"} />
                      <XAxis dataKey="name" stroke={isLight ? "#64748b" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={isLight ? "#64748b" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: isLight ? '#fff' : '#0B1121', borderColor: isLight ? '#e2e8f0' : '#1e293b', color: isLight ? '#0f172a' : '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="score" stroke="#2EA3F2" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, fill: '#2EA3F2' }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`p-6 rounded-2xl border ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#111A31]/80 border-slate-800 shadow-md"}`}
              >
                <h3 className={`text-lg font-bold mb-6 ${isLight ? "text-slate-900" : "text-white"}`}>Subject Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {subjectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: isLight ? '#fff' : '#0B1121', borderColor: isLight ? '#e2e8f0' : '#1e293b', color: isLight ? '#0f172a' : '#fff', borderRadius: '8px' }} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: isLight ? '#0f172a' : '#fff', paddingTop: '20px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Recent Results */}
            <div className={`p-6 sm:p-8 rounded-2xl border ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#111A31]/80 border-slate-800 shadow-md"}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Recent AI Evaluations</h3>
                <Link to="/student/self-result" className="text-sm font-semibold text-[#2EA3F2] flex items-center hover:underline">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentResults.map((res, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={res.subject}
                    className={`p-5 rounded-xl border transition-all hover:shadow-md ${isLight ? "bg-slate-50 border-slate-100 hover:border-slate-200" : "bg-[#0B1121] border-slate-800 hover:border-slate-700"}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{res.subject}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{res.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${res.score >= 85 ? 'text-emerald-500' : res.score >= 70 ? 'text-blue-500' : 'text-amber-500'}`}>
                          {res.score}/100
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className={`w-full h-2 rounded-full mb-3 overflow-hidden ${isLight ? "bg-slate-200" : "bg-slate-800"}`}>
                      <div 
                        className={`h-full rounded-full ${res.score >= 85 ? 'bg-emerald-500' : res.score >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                        style={{ width: `${res.score}%` }} 
                      />
                    </div>
                    
                    <div className={`flex items-start gap-3 p-3 rounded-lg text-sm ${isLight ? "bg-blue-50/50 text-slate-700" : "bg-blue-900/10 text-slate-300"}`}>
                      <BrainCircuit className="w-4 h-4 text-[#2EA3F2] shrink-0 mt-0.5" />
                      <p><strong className={isLight ? "text-slate-900" : "text-white"}>AI Insight:</strong> {res.feedback}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panel (AI Suggestions, Leaderboard, News) */}
          <div className="space-y-8">
            
            {/* AI Suggestions Panel */}
            <div className={`p-6 rounded-2xl border relative overflow-hidden ${isLight ? "bg-gradient-to-br from-[#f8fbff] to-white border-blue-100 shadow-sm" : "bg-gradient-to-br from-[#122244] to-[#0B1121] border-blue-900/30 shadow-md"}`}>
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-500">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>AI Coaching</h3>
              </div>
              
              <ul className="space-y-4 relative z-10">
                <li className={`flex items-start gap-3 pb-4 border-b ${isLight ? "border-slate-100" : "border-slate-800"}`}>
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>Improve DBMS theory answers</p>
                    <p className="text-xs text-slate-500 mt-1">Your ER diagrams are great, but definitions lack precision. Review chapter 4.</p>
                  </div>
                </li>
                <li className={`flex items-start gap-3 pb-4 border-b ${isLight ? "border-slate-100" : "border-slate-800"}`}>
                  <Activity className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>Practice coding for DAA</p>
                    <p className="text-xs text-slate-500 mt-1">Focus on greedy algorithms implementation to boost your upcoming mid-term score.</p>
                  </div>
                </li>
                <Link to="/student/analytics" className="inline-flex items-center text-sm font-semibold text-[#2EA3F2] hover:underline mt-2">
                  View Full Report <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </ul>
            </div>

            {/* Leaderboard */}
            <div className={`p-6 rounded-2xl border ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#111A31]/80 border-slate-800 shadow-md"}`}>
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Class Leaderboard</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { rank: 1, name: "K. Reddy", score: 95, medal: "text-yellow-400" },
                  { rank: 2, name: "S. Patel", score: 92, medal: "text-slate-300" },
                  { rank: 3, name: "M. Kumar", score: 89, medal: "text-amber-600" },
                  { rank: 12, name: "Raiyan Ali (You)", score: 78, medal: "text-slate-600" },
                ].map((student, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${student.name.includes('(You)') ? (isLight ? 'bg-blue-50 border border-blue-100' : 'bg-blue-900/20 border border-blue-800') : (isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50')}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 flex items-center justify-center font-bold text-sm">
                        {student.rank <= 3 ? <Trophy className={`w-5 h-5 ${student.medal}`} /> : <span className="text-slate-500">{student.rank}</span>}
                      </div>
                      <span className={`text-sm font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>{student.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#2EA3F2]">{student.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* News & Circulars */}
            <div className={`p-6 rounded-2xl border ${isLight ? "bg-white border-slate-100 shadow-sm" : "bg-[#111A31]/80 border-slate-800 shadow-md"}`}>
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-blue-500" />
                <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>News & Circulars</h3>
              </div>
              
              <div className="space-y-4">
                <div className={`pb-3 border-b ${isLight ? "border-slate-100" : "border-slate-800"}`}>
                  <span className="text-[10px] font-bold px-2 py-1 uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-md mb-2 inline-block">Exam Notice</span>
                  <p className={`text-sm font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>Mid-term schedules for CSE finalized.</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold px-2 py-1 uppercase tracking-wider bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md mb-2 inline-block">Internship</span>
                  <p className={`text-sm font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>Google STEP internship applications open.</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <LandingThemeProvider>
      <StudentDashboardContent />
    </LandingThemeProvider>
  );
}
