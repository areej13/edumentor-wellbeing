import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Brain, Users, AlertTriangle, TrendingUp, Filter, MessageSquare, Save, X, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import SolutionsLibrary from "@/components/SolutionsLibrary";
import ReportExport from "@/components/ReportExport";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const PIE_COLORS = ["hsl(224,64%,33%)", "hsl(245,100%,69%)"];

const statusColors: Record<string, string> = {
  "جديد": "bg-warning/15 text-warning",
  "قيد المراجعة": "bg-accent/15 text-accent",
  "تمت المعالجة": "bg-success/15 text-success",
};

interface Report {
  id: string;
  role: string;
  education_level: string | null;
  category: string;
  emotion: string | null;
  report_text: string;
  status: string;
  ai_recommendations: string[] | null;
  ai_category_suggestion: string | null;
  ai_emotion_detected: string | null;
  counselor_notes: string | null;
  counselor_recommendation: string | null;
  created_at: string;
}

const Dashboard = () => {
  const [filter, setFilter] = useState("الكل");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [counselorNotes, setCounselorNotes] = useState("");
  const [counselorRec, setCounselorRec] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching reports:", error);
      toast.error("خطأ في تحميل البلاغات");
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    const channel = supabase
      .channel("reports-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => { fetchReports(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openReport = (report: Report) => {
    setSelectedReport(report);
    setCounselorNotes(report.counselor_notes || "");
    setCounselorRec(report.counselor_recommendation || "");
    setNewStatus(report.status);
  };

  const saveReportUpdate = async () => {
    if (!selectedReport) return;
    setSaving(true);
    const { error } = await supabase
      .from("reports")
      .update({ counselor_notes: counselorNotes, counselor_recommendation: counselorRec, status: newStatus })
      .eq("id", selectedReport.id);
    if (error) toast.error("خطأ في حفظ التحديث");
    else { toast.success("تم حفظ التحديث بنجاح"); setSelectedReport(null); fetchReports(); }
    setSaving(false);
  };

  const totalReports = reports.length;
  const newReports = reports.filter(r => r.status === "جديد").length;
  const inReview = reports.filter(r => r.status === "قيد المراجعة").length;
  const resolved = reports.filter(r => r.status === "تمت المعالجة").length;

  const categoryCounts: Record<string, number> = {};
  reports.forEach(r => { categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1; });
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

  const studentCount = reports.filter(r => r.role === "student").length;
  const teacherCount = reports.filter(r => r.role === "teacher").length;
  const pieData = [
    { name: "طلاب", value: studentCount || 0 },
    { name: "معلمون", value: teacherCount || 0 },
  ].filter(d => d.value > 0);

  const filteredReports = reports.filter(r => filter === "الكل" || r.status === filter);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  // Emotion stats
  const emotionCounts: Record<string, number> = {};
  reports.forEach(r => { if (r.emotion) emotionCounts[r.emotion] = (emotionCounts[r.emotion] || 0) + 1; });

  return (
    <div className="min-h-screen px-4 pt-6 pb-24 sm:pb-8">
      <div className="container max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-title-section font-bold text-primary mb-1">لوحة المرشد</h1>
            <p className="text-body text-muted-foreground">نظرة شاملة على البلاغات والتوصيات</p>
          </div>
          <ReportExport reports={reports} />
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "إجمالي البلاغات", value: totalReports, icon: FileText, color: "text-primary" },
            { label: "بلاغات جديدة", value: newReports, icon: AlertTriangle, color: "text-warning" },
            { label: "قيد المراجعة", value: inReview, icon: Brain, color: "text-accent" },
            { label: "تمت المعالجة", value: resolved, icon: TrendingUp, color: "text-success" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-lg p-4 border border-border shadow-sm">
                <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-title-section font-bold">{stat.value}</p>
                <p className="text-small text-muted-foreground">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        {reports.length > 0 && (
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
            {pieData.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                <h3 className="text-title-sub font-bold mb-4">حسب الدور</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: "Tajawal", fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Tabs: Reports & Solutions */}
        <Tabs defaultValue="reports" dir="rtl">
          <TabsList className="mb-4">
            <TabsTrigger value="reports" className="gap-1"><FileText className="w-4 h-4" /> البلاغات</TabsTrigger>
            <TabsTrigger value="solutions" className="gap-1"><BookOpen className="w-4 h-4" /> مكتبة الحلول</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <div className="bg-card rounded-lg border border-border shadow-sm p-4">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-title-sub font-bold flex items-center gap-2">
                  <Filter className="w-4 h-4" /> البلاغات ({filteredReports.length})
                </h3>
                <div className="flex gap-2">
                  {["الكل", "جديد", "قيد المراجعة", "تمت المعالجة"].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-full text-small font-medium transition-colors duration-200 ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <p className="text-center text-muted-foreground py-8">جارٍ التحميل...</p>
              ) : filteredReports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد بلاغات</p>
              ) : (
                <div className="space-y-3">
                  {filteredReports.map(report => (
                    <motion.div key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      onClick={() => openReport(report)}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 gap-3 cursor-pointer hover:bg-muted transition-colors">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-btn font-bold text-primary">{report.category}</span>
                          {report.emotion && <span className="text-small text-muted-foreground">• {report.emotion}</span>}
                        </div>
                        <p className="text-body text-foreground truncate">{report.report_text}</p>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-small font-medium ${statusColors[report.status] || ""}`}>{report.status}</span>
                        <span className="text-small text-muted-foreground">{timeAgo(report.created_at)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="solutions">
            <div className="bg-card rounded-lg border border-border shadow-sm p-4">
              <SolutionsLibrary />
            </div>
          </TabsContent>
        </Tabs>

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-title-sub font-bold text-primary">تفاصيل البلاغ</h2>
                <div className="flex items-center gap-2">
                  <ReportExport reports={reports} selectedReport={selectedReport} />
                  <button onClick={() => setSelectedReport(null)} className="p-1 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-small">
                <div className="bg-muted/50 rounded-lg p-3"><span className="text-muted-foreground">التصنيف:</span><p className="font-bold">{selectedReport.category}</p></div>
                <div className="bg-muted/50 rounded-lg p-3"><span className="text-muted-foreground">المشاعر:</span><p className="font-bold">{selectedReport.emotion || "—"}</p></div>
                <div className="bg-muted/50 rounded-lg p-3"><span className="text-muted-foreground">الدور:</span><p className="font-bold">{selectedReport.role === "student" ? "طالب" : "معلم"}</p></div>
                <div className="bg-muted/50 rounded-lg p-3"><span className="text-muted-foreground">المرحلة:</span><p className="font-bold">{selectedReport.education_level || "—"}</p></div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <p className="text-small text-muted-foreground mb-1">نص البلاغ:</p>
                <p className="text-body">{selectedReport.report_text}</p>
              </div>

              {selectedReport.ai_recommendations && selectedReport.ai_recommendations.length > 0 && (
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-4">
                  <h3 className="text-btn font-bold text-accent mb-2 flex items-center gap-2"><Brain className="w-4 h-4" /> توصيات الذكاء الاصطناعي</h3>
                  <ul className="space-y-1.5">
                    {selectedReport.ai_recommendations.map((rec, i) => (
                      <li key={i} className="text-small flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4 border-t border-border pt-4">
                <h3 className="text-btn font-bold flex items-center gap-2"><MessageSquare className="w-4 h-4" /> إدارة الحالة</h3>
                <div>
                  <label className="text-small text-muted-foreground mb-1 block">الحالة</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-card text-body">
                    <option value="جديد">جديد</option>
                    <option value="قيد المراجعة">قيد المراجعة</option>
                    <option value="تمت المعالجة">تمت المعالجة</option>
                  </select>
                </div>
                <div>
                  <label className="text-small text-muted-foreground mb-1 block">ملاحظات المرشد</label>
                  <textarea value={counselorNotes} onChange={e => setCounselorNotes(e.target.value)} placeholder="أضف ملاحظاتك هنا..." rows={3} className="w-full p-3 rounded-lg border border-border bg-card text-body resize-none" />
                </div>
                <div>
                  <label className="text-small text-muted-foreground mb-1 block">توصية المرشد</label>
                  <textarea value={counselorRec} onChange={e => setCounselorRec(e.target.value)} placeholder="أضف توصيتك الشخصية..." rows={3} className="w-full p-3 rounded-lg border border-border bg-card text-body resize-none" />
                </div>
                <button onClick={saveReportUpdate} disabled={saving} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-btn font-bold disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? "جارٍ الحفظ..." : "حفظ التحديث"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
