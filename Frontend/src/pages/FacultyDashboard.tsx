import { Link } from "react-router-dom";
import { 
  FileText, Layers, BarChart3, Activity, Users, 
  CheckCircle, Clock, Zap, DownloadCloud, BrainCircuit,
  TrendingUp, AlertCircle, FileCheck, ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { LandingThemeProvider, useLandingTheme } from "@/contexts/LandingThemeContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const subjectMarksData = [
  { name: 'DBMS', avg: 78, max: 95 },
  { name: 'OS', avg: 65, max: 88 },
  { name: 'DAA', avg: 82, max: 98 },
  { name: 'CN', avg: 71, max: 92 },
  { name: 'SE', avg: 85, max: 96 },
];

const workloadData = [
  { day: 'Mon', scripts: 45 },
  { day: 'Tue', scripts: 80 },
  { day: 'Wed', scripts: 65 },
  { day: 'Thu', scripts: 120 },
  { day: 'Fri', scripts: 90 },
];

const stats = [
  { title: "Pending Evaluations", value: "142", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { title: "Completed Today", value: "86", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  { title: "Avg AI Accuracy", value: "94%", icon: Activity, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  { title: "AI Confidence", value: "High", icon: BrainCircuit, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  { title: "Total Students", value: "1,240", icon: Users, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
];

const recentEvaluations = [
  { id: "EV-2041", student: "Raiyan Ali", subject: "DBMS", marks: 85, aiScore: 84, status: "Verified" },
  { id: "EV-2042", student: "K. Reddy", subject: "DAA", marks: 95, aiScore: 95, status: "Auto-Approved" },
  { id: "EV-2043", student: "S. Patel", subject: "OS", marks: 72, aiScore: 68, status: "Needs Review" },
  { id: "EV-2044", student: "M. Kumar", subject: "CN", marks: 88, aiScore: 87, status: "Verified" },
  { id: "EV-2045", student: "A. Sharma", subject: "DBMS", marks: 64, aiScore: 62, status: "Needs Review" },
];

function FacultyDashboardContent() {
  const { theme } = useLandingTheme();
  // Faculty dashboard heavily leans into the dark executive theme, even in "light" mode we keep it premium but adapt colors.
  const isLight = theme === "light";

  return (
    <div className={`min-h-[calc(100vh-4rem)] -m-6 md:-m-8 p-6 md:p-8 lg:p-10 ${isLight ? "bg-[#f4f7fb]" : "bg-[#020817]"}`}>
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 ${isLight ? "bg-gradient-to-r from-[#001b3a] to-[#003b7a] text-white shadow-xl" : "bg-gradient-to-r from-[#0B1221] to-[#111C35] border border-blue-900/30 text-white shadow-2xl"}`}
        >
          <div className="absolute top-0 right-0 w-2/3 h-full opacity-30 pointer-events-none mix-blend-overlay">
            <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000&auto=format&fit=crop" alt="Faculty Teaching" className="w-full h-full object-cover" style={{ maskImage: 'linear-gradient(to right, transparent, black)' }} />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-400/20 mb-6">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Evaluation Engine Active</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
              Faculty Dashboard
            </h1>
            <p className="text-lg sm:text-xl text-blue-200/80 max-w-xl font-light">
              Academic Evaluation Control Center. Accelerate your grading workflow with AI-powered precision.
            </p>
          </div>
        </motion.div>

        {/* Action Hub */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Single Evaluation", desc: "Detailed AI analysis for one script", icon: FileCheck, to: "/evaluate", color: "from-blue-500 to-cyan-500" },
            { title: "Batch Evaluation", desc: "Process up to 100 scripts at once", icon: Layers, to: "/batch", color: "from-indigo-500 to-purple-500" },
            { title: "Upload PDF Scripts", desc: "Digitize physical answer sheets", icon: DownloadCloud, to: "/dashboard/faculty", color: "from-emerald-500 to-teal-500" },
          ].map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={action.to} className={`block p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0f172a]/90 border-slate-800"}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${action.color} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`}></div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} p-0.5 mb-6 shadow-lg`}>
                  <div className="w-full h-full bg-[#0f172a] rounded-[10px] flex items-center justify-center">
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>{action.title}</h3>
                <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`p-5 rounded-xl border backdrop-blur-xl transition-all ${isLight ? "bg-white shadow-sm border-slate-200" : "bg-[#0b1429]/80 border-slate-800"}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.border} border`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>{stat.title}</p>
              </div>
              <p className={`text-3xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Analytics & Table Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 space-y-8">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b1429]/80 border-slate-800"}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Subject-wise Performance</h3>
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectMarksData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#1e293b"} vertical={false} />
                      <XAxis dataKey="name" stroke={isLight ? "#64748b" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={isLight ? "#64748b" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: isLight ? '#fff' : '#0B1121', borderColor: isLight ? '#e2e8f0' : '#1e293b', borderRadius: '8px' }} cursor={{ fill: isLight ? '#f1f5f9' : '#1e293b' }} />
                      <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Average Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`p-6 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b1429]/80 border-slate-800"}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Evaluation Workload</h3>
                  <TrendingUp className="w-5 h-5 text-slate-400" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={workloadData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScripts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#1e293b"} vertical={false} />
                      <XAxis dataKey="day" stroke={isLight ? "#64748b" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={isLight ? "#64748b" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: isLight ? '#fff' : '#0B1121', borderColor: isLight ? '#e2e8f0' : '#1e293b', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="scripts" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScripts)" name="Scripts Evaluated" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Recent Evaluations Table */}
            <div className={`rounded-2xl border overflow-hidden ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b1429]/80 border-slate-800"}`}>
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Recent Evaluations</h3>
                <Link to="/results" className="text-sm font-semibold text-blue-500 hover:text-blue-400 flex items-center">
                  View All <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={isLight ? "bg-slate-50 border-b border-slate-200" : "bg-[#0f172a] border-b border-slate-800"}>
                      <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>ID</th>
                      <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>Student</th>
                      <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>Subject</th>
                      <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>Marks</th>
                      <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>AI Score</th>
                      <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {recentEvaluations.map((row) => (
                      <tr key={row.id} className={`transition-colors ${isLight ? "hover:bg-slate-50 border-b border-slate-100" : "hover:bg-[#0f172a] border-b border-slate-800/50"}`}>
                        <td className={`px-6 py-4 font-mono text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>{row.id}</td>
                        <td className={`px-6 py-4 font-medium ${isLight ? "text-slate-900" : "text-slate-200"}`}>{row.student}</td>
                        <td className={`px-6 py-4 ${isLight ? "text-slate-600" : "text-slate-300"}`}>{row.subject}</td>
                        <td className={`px-6 py-4 font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{row.marks}/100</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${Math.abs(row.marks - row.aiScore) > 5 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                            <BrainCircuit className="w-3 h-3" />
                            {row.aiScore}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            row.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500' : 
                            row.status === 'Auto-Approved' ? 'bg-purple-500/10 text-purple-400' : 
                            'bg-amber-500/10 text-amber-500'
                          }`}>
                            {row.status === 'Needs Review' ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* AI Insight Panel */}
            <div className={`p-6 rounded-2xl border relative overflow-hidden ${isLight ? "bg-gradient-to-br from-indigo-50 to-white border-indigo-100" : "bg-gradient-to-br from-[#1e1b4b]/40 to-[#0b1429] border-indigo-900/30"}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-500 border border-indigo-500/20">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>AI Insights</h3>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className={`p-4 rounded-xl border ${isLight ? "bg-white border-slate-100" : "bg-[#020817]/60 border-slate-800"}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-slate-200"}`}>Action Required: OS Batch</p>
                      <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>12 students showed identical weak patterns in memory management answers. Potential plagiarism or conceptual gap.</p>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl border ${isLight ? "bg-white border-slate-100" : "bg-[#020817]/60 border-slate-800"}`}>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-slate-200"}`}>Performance Spike: DAA</p>
                      <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>Average score for Dynamic Programming questions increased by 15% this semester.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Notices */}
            <div className={`p-6 rounded-2xl border ${isLight ? "bg-white border-slate-200" : "bg-[#0b1429]/80 border-slate-800"}`}>
              <h3 className={`text-lg font-bold mb-6 ${isLight ? "text-slate-900" : "text-white"}`}>Department Notices</h3>
              
              <ul className="space-y-4">
                <li className={`pb-4 border-b ${isLight ? "border-slate-100" : "border-slate-800"}`}>
                  <span className="text-[10px] font-bold px-2 py-1 uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-md mb-2 inline-block">Urgent</span>
                  <p className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-200"}`}>Submit Mid-1 evaluations by Friday.</p>
                </li>
                <li>
                  <span className="text-[10px] font-bold px-2 py-1 uppercase tracking-wider bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-md mb-2 inline-block">Meeting</span>
                  <p className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-200"}`}>Faculty board meeting on AI Grading policies tomorrow at 10 AM.</p>
                </li>
              </ul>
            </div>

            {/* Export Action */}
            <button className={`w-full py-4 rounded-xl border border-dashed flex items-center justify-center gap-2 font-semibold transition-colors ${isLight ? "border-slate-300 text-slate-600 hover:bg-slate-50" : "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/50"}`}>
              <DownloadCloud className="w-5 h-5" />
              Export Full Report (CSV)
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function FacultyDashboard() {
  return (
    <LandingThemeProvider>
      <FacultyDashboardContent />
    </LandingThemeProvider>
  );
}
