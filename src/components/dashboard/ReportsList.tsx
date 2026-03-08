import { useState } from "react";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";

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

const statusColors: Record<string, string> = {
  "جديد": "bg-warning/15 text-warning",
  "قيد المراجعة": "bg-accent/15 text-accent",
  "تمت المعالجة": "bg-success/15 text-success",
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.floor(hours / 24)} يوم`;
};

interface ReportsListProps {
  reports: Report[];
  loading: boolean;
  onSelectReport: (report: Report) => void;
  title: string;
}

const ReportsList = ({ reports, loading, onSelectReport, title }: ReportsListProps) => {
  const [filter, setFilter] = useState("الكل");
  const filteredReports = reports.filter(r => filter === "الكل" || r.status === filter);

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-title-sub font-bold flex items-center gap-2">
          <Filter className="w-4 h-4" /> {title} ({filteredReports.length})
        </h3>
        <div className="flex gap-2 flex-wrap">
          {["الكل", "جديد", "قيد المراجعة", "تمت المعالجة"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-small font-medium transition-colors duration-200 ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
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
            <motion.div
              key={report.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => onSelectReport(report)}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 gap-3 cursor-pointer hover:bg-muted transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-btn font-bold text-primary">{report.category}</span>
                  {report.emotion && <span className="text-small text-muted-foreground">• {report.emotion}</span>}
                  {report.tracking_code && (
                    <span className="text-small font-mono bg-accent/10 text-accent px-2 py-0.5 rounded">{report.tracking_code}</span>
                  )}
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
  );
};

export default ReportsList;
