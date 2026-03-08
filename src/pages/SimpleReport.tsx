import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, User, GraduationCap, CheckCircle, Clock, XCircle } from "lucide-react";

interface Report {
  code: string;
  role: string;
  text: string;
  status: "pending" | "approved";
  response?: string;
}

const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "#";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const SimpleReport = () => {
  const [reports, setReports] = useState<Report[]>([]);

  // Submit section state
  const [role, setRole] = useState<string | null>(null);
  const [reportText, setReportText] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  // Track section state
  const [trackCode, setTrackCode] = useState("");
  const [trackResult, setTrackResult] = useState<null | { found: boolean; report?: Report }>(null);

  const handleSubmit = () => {
    if (!role || !reportText.trim()) return;
    const code = generateCode();
    const newReport: Report = { code, role, text: reportText, status: "pending" };
    setReports((prev) => [...prev, newReport]);
    setSubmittedCode(code);
    setRole(null);
    setReportText("");
  };

  const handleTrack = () => {
    const found = reports.find((r) => r.code === trackCode.trim());
    setTrackResult(found ? { found: true, report: found } : { found: false });
  };

  const resetSubmit = () => setSubmittedCode(null);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-8 pb-28 sm:pb-12 gap-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary">المرشد الذكي</h1>

      <div className="w-full max-w-lg flex flex-col gap-8">
        {/* === Section 1: Submit Report === */}
        <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold text-primary mb-4 text-center">📝 إرسال بلاغ</h2>

          <AnimatePresence mode="wait">
            {submittedCode ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-3"
              >
                <CheckCircle className="w-14 h-14 text-success mx-auto" />
                <p className="text-lg font-bold text-foreground">تم استلام بلاغك ✅</p>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-muted-foreground text-sm mb-1">كود متابعتك:</p>
                  <p className="text-2xl font-mono font-bold text-accent tracking-widest">{submittedCode}</p>
                </div>
                <p className="text-sm text-muted-foreground">احتفظ بهذا الكود لمتابعة رد المرشد</p>
                <button
                  onClick={resetSubmit}
                  className="mt-3 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  إرسال بلاغ جديد
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Role selection */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "طالب", value: "student", Icon: GraduationCap },
                    { label: "معلم", value: "teacher", Icon: User },
                  ].map(({ label, value, Icon }) => (
                    <button
                      key={value}
                      onClick={() => setRole(value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                        ${role === value ? "border-accent bg-accent/10 shadow-sm" : "border-border bg-background hover:border-primary/30"}`}
                    >
                      <Icon className={`w-8 h-8 ${role === value ? "text-accent" : "text-muted-foreground"}`} />
                      <span className={`font-bold text-sm ${role === value ? "text-accent" : "text-foreground"}`}>{label}</span>
                    </button>
                  ))}
                </div>

                {/* Text input */}
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="اكتب مشكلتك هنا..."
                  rows={4}
                  className="w-full p-4 rounded-xl border-2 border-border bg-background text-foreground text-sm resize-none focus:outline-none focus:border-accent transition-colors"
                />

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={!role || !reportText.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  إرسال
                  <Send className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* === Section 2: Track Report === */}
        <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold text-primary mb-4 text-center">🔍 متابعة بلاغ</h2>

          <div className="flex gap-2 mb-4">
            <input
              value={trackCode}
              onChange={(e) => {
                setTrackCode(e.target.value);
                setTrackResult(null);
              }}
              placeholder="أدخل كود المتابعة مثل #A7X392"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={handleTrack}
              disabled={!trackCode.trim()}
              className="px-5 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm disabled:opacity-40 hover:bg-accent/90 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {trackResult && (
              <motion.div
                key={trackResult.found ? trackResult.report?.status : "notfound"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                {!trackResult.found ? (
                  <div className="space-y-2">
                    <XCircle className="w-10 h-10 text-destructive mx-auto" />
                    <p className="font-bold text-destructive">الكود غير صحيح ❌</p>
                  </div>
                ) : trackResult.report?.status === "approved" ? (
                  <div className="space-y-3">
                    <CheckCircle className="w-10 h-10 text-success mx-auto" />
                    <p className="font-bold text-success">تمت الموافقة ✅</p>
                    <div className="bg-muted rounded-xl p-4 text-sm text-foreground text-right">
                      {trackResult.report.response || "سيتم مراجعة بلاغك من قبل المرشد وتقديم التوصيات المناسبة."}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Clock className="w-10 h-10 text-warning mx-auto" />
                    <p className="font-bold text-warning">بلاغك قيد المراجعة ⏳</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SimpleReport;
