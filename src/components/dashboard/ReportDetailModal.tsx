import { useState } from "react";
import { motion } from "framer-motion";
import { X, Brain, MessageSquare, Save, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ReportExport from "@/components/ReportExport";

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

interface ReportDetailModalProps {
  report: Report;
  allReports: Report[];
  onClose: () => void;
  onSaved: () => void;
}

const ReportDetailModal = ({ report, allReports, onClose, onSaved }: ReportDetailModalProps) => {
  const [counselorNotes, setCounselorNotes] = useState(report.counselor_notes || "");
  const [counselorRec, setCounselorRec] = useState(report.counselor_recommendation || "");
  const [newStatus, setNewStatus] = useState(report.status);
  const [saving, setSaving] = useState(false);

  const saveReportUpdate = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("reports")
      .update({ counselor_notes: counselorNotes, counselor_recommendation: counselorRec, status: newStatus })
      .eq("id", report.id);
    if (error) toast.error("خطأ في حفظ التحديث");
    else { toast.success("تم حفظ التحديث بنجاح"); onSaved(); onClose(); }
    setSaving(false);
  };

  const addToKnowledgeBase = async () => {
    const { error } = await supabase.from("counselor_solutions").insert({
      title: `حل لحالة: ${report.category}`,
      content: counselorRec,
      category: report.category,
      is_reusable: true,
      counselor_id: (await supabase.auth.getUser()).data.user?.id || "",
    });
    if (error) toast.error("خطأ في إضافة الحل");
    else toast.success("تمت إضافة الحل إلى قاعدة المعرفة الإرشادية ✅");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-xl border border-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title-sub font-bold text-primary">تفاصيل البلاغ</h2>
          <div className="flex items-center gap-2">
            <ReportExport reports={allReports} selectedReport={report} />
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-small">
          <div className="bg-muted/50 rounded-lg p-3"><span className="text-muted-foreground">التصنيف:</span><p className="font-bold">{report.category}</p></div>
          <div className="bg-muted/50 rounded-lg p-3"><span className="text-muted-foreground">المشاعر:</span><p className="font-bold">{report.emotion || "—"}</p></div>
          <div className="bg-muted/50 rounded-lg p-3"><span className="text-muted-foreground">الدور:</span><p className="font-bold">{report.role === "student" ? "طالب" : "معلم"}</p></div>
          <div className="bg-muted/50 rounded-lg p-3"><span className="text-muted-foreground">المرحلة:</span><p className="font-bold">{report.education_level || "—"}</p></div>
          {report.tracking_code && (
            <div className="bg-muted/50 rounded-lg p-3 col-span-2">
              <span className="text-muted-foreground">كود المتابعة:</span>
              <p className="font-bold font-mono text-accent text-lg">{report.tracking_code}</p>
            </div>
          )}
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <p className="text-small text-muted-foreground mb-1">نص البلاغ:</p>
          <p className="text-body">{report.report_text}</p>
        </div>

        {report.ai_recommendations && report.ai_recommendations.length > 0 && (
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-4">
            <h3 className="text-btn font-bold text-accent mb-2 flex items-center gap-2"><Brain className="w-4 h-4" /> توصيات الذكاء الاصطناعي</h3>
            <ul className="space-y-1.5">
              {report.ai_recommendations.map((rec, i) => (
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

          {counselorRec.trim() && (
            <button
              onClick={addToKnowledgeBase}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-success/10 text-success border border-success/20 text-btn font-bold hover:bg-success/20 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> إضافة هذا الحل إلى قاعدة المعرفة
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReportDetailModal;
