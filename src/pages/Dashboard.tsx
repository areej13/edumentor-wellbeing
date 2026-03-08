import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, BookOpen, GraduationCap, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import SolutionsLibrary from "@/components/SolutionsLibrary";
import ReportExport from "@/components/ReportExport";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ReportsList from "@/components/dashboard/ReportsList";
import ReportDetailModal from "@/components/dashboard/ReportDetailModal";
import CategoryChart from "@/components/dashboard/CategoryChart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  tracking_code?: string | null;
}

const Dashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

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

  const studentReports = reports.filter(r => r.role === "student");
  const teacherReports = reports.filter(r => r.role === "teacher");

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

        {/* Overall Stats */}
        <DashboardStats reports={reports} label="الإحصائيات العامة" />

        {/* Role-based sections */}
        <Tabs defaultValue="students" dir="rtl" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="students" className="gap-1"><GraduationCap className="w-4 h-4" /> بلاغات الطلاب ({studentReports.length})</TabsTrigger>
            <TabsTrigger value="teachers" className="gap-1"><User className="w-4 h-4" /> بلاغات المعلمين ({teacherReports.length})</TabsTrigger>
            <TabsTrigger value="solutions" className="gap-1"><BookOpen className="w-4 h-4" /> مكتبة الحلول</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <DashboardStats reports={studentReports} label="إحصائيات بلاغات الطلاب" />
            <CategoryChart reports={studentReports} title="تصنيفات مشكلات الطلاب" />
            <ReportsList
              reports={studentReports}
              loading={loading}
              onSelectReport={setSelectedReport}
              title="بلاغات الطلاب"
            />
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-4">
            <DashboardStats reports={teacherReports} label="إحصائيات بلاغات المعلمين" />
            <CategoryChart reports={teacherReports} title="تصنيفات مشكلات المعلمين" />
            <ReportsList
              reports={teacherReports}
              loading={loading}
              onSelectReport={setSelectedReport}
              title="بلاغات المعلمين"
            />
          </TabsContent>

          {/* Solutions Tab */}
          <TabsContent value="solutions">
            <div className="bg-card rounded-lg border border-border shadow-sm p-4">
              <SolutionsLibrary />
            </div>
          </TabsContent>
        </Tabs>

        {/* Report Detail Modal */}
        {selectedReport && (
          <ReportDetailModal
            report={selectedReport}
            allReports={reports}
            onClose={() => setSelectedReport(null)}
            onSaved={fetchReports}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
