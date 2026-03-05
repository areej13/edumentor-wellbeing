import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Brain, Users, BookOpen, AlertTriangle, TrendingUp, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const categoryData = [
  { name: "نفسية", count: 24 },
  { name: "اجتماعية", count: 18 },
  { name: "أكاديمية", count: 32 },
  { name: "سلوكية", count: 12 },
  { name: "إدارية", count: 8 },
  { name: "مرافق", count: 6 },
  { name: "اقتراحات", count: 14 },
];

const pieData = [
  { name: "طلاب", value: 85 },
  { name: "معلمون", value: 29 },
];

const PIE_COLORS = ["hsl(224,64%,33%)", "hsl(245,100%,69%)"];

const recentReports = [
  { id: 1, category: "أكاديمية", emotion: "قلق", snippet: "صعوبة في مادة الرياضيات...", time: "منذ ساعة", status: "جديد" },
  { id: 2, category: "نفسية", emotion: "حزين", snippet: "أشعر بالوحدة في المدرسة...", time: "منذ 3 ساعات", status: "قيد المراجعة" },
  { id: 3, category: "سلوكية", emotion: "غاضب", snippet: "تعرضت لموقف مع زميل...", time: "منذ 5 ساعات", status: "تمت المعالجة" },
  { id: 4, category: "اجتماعية", emotion: "مرهق", snippet: "مشاكل مع الأصدقاء...", time: "أمس", status: "جديد" },
];

const statusColors: Record<string, string> = {
  "جديد": "bg-warning/15 text-warning",
  "قيد المراجعة": "bg-accent/15 text-accent",
  "تمت المعالجة": "bg-success/15 text-success",
};

const aiRecommendations = [
  "زيادة ملحوظة في البلاغات الأكاديمية – يُنصح بتقييم المناهج",
  "3 حالات تنمر محتملة تحتاج متابعة عاجلة",
  "تحسن في مستوى الرضا العام مقارنة بالشهر السابق",
];

const Dashboard = () => {
  const [filter, setFilter] = useState("الكل");
  const totalReports = 114;

  return (
    <div className="min-h-screen px-4 pt-6 pb-24 sm:pb-8">
      <div className="container max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-title-section font-bold text-primary mb-1">لوحة المرشد</h1>
          <p className="text-body text-muted-foreground mb-6">نظرة شاملة على البلاغات والتوصيات</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "إجمالي البلاغات", value: totalReports, icon: FileText, color: "text-primary" },
            { label: "بلاغات جديدة", value: 12, icon: AlertTriangle, color: "text-warning" },
            { label: "قيد المراجعة", value: 8, icon: Brain, color: "text-accent" },
            { label: "تمت المعالجة", value: 94, icon: TrendingUp, color: "text-success" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-lg p-4 border border-border shadow-sm"
              >
                <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-title-section font-bold">{stat.value}</p>
                <p className="text-small text-muted-foreground">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="sm:col-span-2 bg-card rounded-lg border border-border p-4 shadow-sm">
            <h3 className="text-title-sub font-bold mb-4">البلاغات حسب التصنيف</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "Tajawal" }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontFamily: "Tajawal", fontSize: 13 }} />
                <Bar dataKey="count" fill="hsl(224,64%,33%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
            <h3 className="text-title-sub font-bold mb-4">حسب الدور</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: "Tajawal", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
          <h3 className="text-title-sub font-bold text-accent mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            توصيات الذكاء الاصطناعي
          </h3>
          <ul className="space-y-2">
            {aiRecommendations.map((rec, i) => (
              <li key={i} className="text-body text-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Filter + Recent Reports */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-title-sub font-bold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              أحدث البلاغات
            </h3>
            <div className="flex gap-2">
              {["الكل", "جديد", "قيد المراجعة", "تمت المعالجة"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-small font-medium transition-colors duration-200
                    ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {recentReports
              .filter((r) => filter === "الكل" || r.status === filter)
              .map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-btn font-bold text-primary">{report.category}</span>
                      <span className="text-small text-muted-foreground">• {report.emotion}</span>
                    </div>
                    <p className="text-body text-foreground truncate">{report.snippet}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-small font-medium ${statusColors[report.status]}`}>
                      {report.status}
                    </span>
                    <span className="text-small text-muted-foreground">{report.time}</span>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
