import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, BookOpen, Footprints, Heart, 
  Lightbulb, HandHeart, MessageCircleHeart, ShieldCheck,
  Sparkles, ArrowLeft, Eye, Copy, FileText, FileDown, Check, Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AIRecommendation {
  recommendations: string[];
  suggested_category: string;
  detected_emotion: string;
  severity: string;
  supportive_message: string;
  scenario?: string;
}

interface Props {
  aiResult: AIRecommendation;
  role?: string | null;
}

const studentStepMeta = [
  { icon: Eye, label: "فهم الموقف", gradient: "from-primary/10 to-primary/5", border: "border-primary/20", iconColor: "text-primary" },
  { icon: Footprints, label: "شيء بسيط تقدر تسويه", gradient: "from-accent/10 to-accent/5", border: "border-accent/20", iconColor: "text-accent" },
  { icon: Sparkles, label: "خطوة ثانية تساعدك", gradient: "from-secondary/20 to-secondary/10", border: "border-secondary/30", iconColor: "text-secondary-foreground" },
  { icon: HandHeart, label: "لا تتردد تطلب مساعدة", gradient: "from-success/10 to-success/5", border: "border-success/20", iconColor: "text-success" },
  { icon: Heart, label: "تذكّر دائماً", gradient: "from-primary/10 to-accent/5", border: "border-primary/15", iconColor: "text-primary" },
];

const teacherStepMeta = [
  { icon: Lightbulb, label: "التوصية الأولى", gradient: "from-primary/10 to-primary/5", border: "border-primary/20", iconColor: "text-primary" },
  { icon: Footprints, label: "التوصية الثانية", gradient: "from-accent/10 to-accent/5", border: "border-accent/20", iconColor: "text-accent" },
  { icon: Sparkles, label: "التوصية الثالثة", gradient: "from-secondary/20 to-secondary/10", border: "border-secondary/30", iconColor: "text-secondary-foreground" },
  { icon: ShieldCheck, label: "التوصية الرابعة", gradient: "from-success/10 to-success/5", border: "border-success/20", iconColor: "text-success" },
  { icon: HandHeart, label: "التوصية الخامسة", gradient: "from-primary/10 to-accent/5", border: "border-primary/15", iconColor: "text-primary" },
];

const AIRecommendationsView = ({ aiResult, role }: Props) => {
  const navigate = useNavigate();
  const isTeacher = role === "teacher";
  const stepMeta = isTeacher ? teacherStepMeta : studentStepMeta;
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const parseStep = (rec: string) => {
    const dashIndex = rec.indexOf(" - ");
    if (dashIndex > 0 && dashIndex < 30) {
      return { title: rec.slice(0, dashIndex), content: rec.slice(dashIndex + 3) };
    }
    return { title: null, content: rec };
  };

  const buildPlainText = () => {
    const lines: string[] = [];
    lines.push("المرشد الذكي - EDUMENTOR AI");
    lines.push(`التصنيف: ${aiResult.suggested_category}`);
    lines.push("");
    if (aiResult.scenario) {
      lines.push(`📖 سيناريو مشابه:`);
      lines.push(aiResult.scenario);
      lines.push("");
    }
    lines.push("📋 الخطوات المقترحة:");
    aiResult.recommendations.forEach((rec, i) => {
      const { title, content } = parseStep(rec);
      lines.push(`${i + 1}. ${title ? `${title}: ` : ""}${content}`);
    });
    lines.push("");
    lines.push(`💚 ${aiResult.supportive_message}`);
    lines.push("");
    lines.push("⚠️ هذه توصيات أولية مبنية على إرشادات وزارة التعليم وسيراجعها المرشد الطلابي.");
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainText());
      setCopied(true);
      toast.success("تم نسخ التوصيات");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("تعذر النسخ");
    }
  };

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");
      const { saveAs } = await import("file-saver");

      const children: any[] = [];

      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "المرشد الذكي - EDUMENTOR AI", bold: true, size: 32, font: "Arial" })],
      }));
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: isTeacher ? "توصيات مهنية للمعلم" : "خطوات إرشادية للطالب", size: 24, font: "Arial", color: "666666" })],
      }));
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [new TextRun({ text: `التصنيف: ${aiResult.suggested_category}`, size: 22, font: "Arial" })],
      }));

      if (aiResult.scenario) {
        children.push(new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "سيناريو مشابه:", bold: true, size: 24, font: "Arial" })] }));
        children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: aiResult.scenario, size: 22, font: "Arial" })] }));
      }

      children.push(new Paragraph({ spacing: { before: 200, after: 150 }, children: [new TextRun({ text: "الخطوات المقترحة:", bold: true, size: 24, font: "Arial" })] }));

      aiResult.recommendations.forEach((rec, i) => {
        const { title, content } = parseStep(rec);
        children.push(new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: `${i + 1}. `, bold: true, size: 22, font: "Arial" }),
            ...(title ? [new TextRun({ text: `${title}: `, bold: true, size: 22, font: "Arial" })] : []),
            new TextRun({ text: content, size: 22, font: "Arial" }),
          ],
        }));
      });

      children.push(new Paragraph({ spacing: { before: 250, after: 100 }, children: [new TextRun({ text: "رسالة دعم:", bold: true, size: 24, font: "Arial" })] }));
      children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: aiResult.supportive_message, size: 22, font: "Arial", italics: true })] }));

      const disclaimer = isTeacher
        ? "توصيات مبنية على أدلة وزارة التعليم والأطر التربوية العالمية (OECD, CASEL, UNESCO) وسيراجعها المرشد الطلابي."
        : "هذه توصيات أولية مبنية على إرشادات وزارة التعليم وسيراجعها المرشد الطلابي.";
      children.push(new Paragraph({ spacing: { before: 300 }, children: [new TextRun({ text: `⚠️ ${disclaimer}`, size: 18, font: "Arial", color: "999999" })] }));
      children.push(new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "تم إنشاؤه بواسطة المرشد الذكي - EDUMENTOR AI", size: 16, font: "Arial", color: "AAAAAA" })] }));

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "توصيات-المرشد-الذكي.docx");
      toast.success("تم تصدير التوصيات بنجاح");
    } catch (e) {
      console.error(e);
      toast.error("خطأ في التصدير");
    }
    setExporting(false);
  };

  const handlePrintPDF = () => {
    const stepsHtml = aiResult.recommendations.map((rec, i) => {
      const { title, content } = parseStep(rec);
      return `<div class="step"><div class="step-num">${i + 1}</div><div><strong>${title || ""}</strong><p>${content}</p></div></div>`;
    }).join("");

    const disclaimer = isTeacher
      ? "توصيات مبنية على أدلة وزارة التعليم والأطر التربوية العالمية (OECD, CASEL, UNESCO) وسيراجعها المرشد الطلابي."
      : "هذه توصيات أولية مبنية على إرشادات وزارة التعليم وسيراجعها المرشد الطلابي.";

    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>توصيات المرشد الذكي</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,sans-serif;padding:40px;color:#222;line-height:1.8;max-width:700px;margin:0 auto}
      h1{text-align:center;color:#1a3a6b;font-size:22px;margin-bottom:4px}
      .sub{text-align:center;color:#888;font-size:14px;margin-bottom:25px}
      .scenario{background:#f0f4ff;border-radius:10px;padding:15px;margin-bottom:20px;border-right:4px solid #1a3a6b}
      .scenario h3{color:#1a3a6b;margin-bottom:6px;font-size:15px}
      .steps{margin-bottom:20px}
      .steps h3{color:#1a3a6b;margin-bottom:12px;font-size:16px}
      .step{display:flex;gap:12px;align-items:flex-start;background:#fafbff;border:1px solid #e8ecf4;border-radius:10px;padding:14px;margin-bottom:10px}
      .step-num{width:32px;height:32px;border-radius:50%;background:#1a3a6b;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;flex-shrink:0}
      .step p{font-size:14px;margin-top:2px;color:#444}
      .support{background:#f0faf0;border-radius:10px;padding:15px;margin-bottom:20px;border-right:4px solid #22c55e}
      .support h3{color:#22c55e;margin-bottom:6px;font-size:15px}
      .disclaimer{color:#999;font-size:12px;text-align:center;margin-top:25px;padding-top:15px;border-top:1px solid #eee}
      .footer{text-align:center;color:#bbb;font-size:11px;margin-top:10px}
      @media print{body{padding:20px}}
    </style></head><body>
    <h1>المرشد الذكي - EDUMENTOR AI</h1>
    <p class="sub">${isTeacher ? "توصيات مهنية للمعلم" : "خطوات إرشادية للطالب"} | التصنيف: ${aiResult.suggested_category}</p>
    ${aiResult.scenario ? `<div class="scenario"><h3>📖 سيناريو مشابه</h3><p>${aiResult.scenario}</p></div>` : ""}
    <div class="steps"><h3>📋 الخطوات المقترحة</h3>${stepsHtml}</div>
    <div class="support"><h3>💚 رسالة دعم</h3><p>${aiResult.supportive_message}</p></div>
    <p class="disclaimer">⚠️ ${disclaimer}</p>
    <p class="footer">تم إنشاؤه بواسطة المرشد الذكي - EDUMENTOR AI</p>
    </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  const animDelay = 0.6 + aiResult.recommendations.length * 0.12;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-24 pt-8 sm:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-4"
      >
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-9 h-9 text-success" />
          </div>
          <h2 className="text-title-section font-bold text-primary mb-1">
            تم استلام بلاغك بسرية تامة
          </h2>
          <p className="text-small text-muted-foreground">
            {isTeacher ? "إليك بعض التوصيات المهنية" : "إليك بعض الخطوات البسيطة اللي ممكن تساعدك 💪"}
          </p>
        </motion.div>

        {/* Scenario Card */}
        {aiResult.scenario && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl bg-primary/5 border border-primary/15 p-5"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <span className="text-btn font-bold text-primary">
                {isTeacher ? "موقف مشابه" : "هل مريت بموقف زي كذا؟"}
              </span>
            </div>
            <p className="text-body text-foreground/85 leading-relaxed pr-1">
              {aiResult.scenario}
            </p>
          </motion.div>
        )}

        {/* Interactive Step Cards */}
        <div className="space-y-3">
          {aiResult.recommendations.map((rec, i) => {
            const meta = stepMeta[i % stepMeta.length];
            const Icon = meta.icon;
            const delay = 0.3 + i * 0.12;
            const { title, content } = parseStep(rec);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay, type: "spring", stiffness: 100, damping: 14 }}
                className={`relative rounded-2xl bg-gradient-to-br ${meta.gradient} border ${meta.border} p-4 shadow-sm`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-card/80 shadow-sm flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${meta.iconColor}`} />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow-sm">
                      {i + 1}
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5 flex-1">
                    <p className="text-small font-bold text-foreground/70 mb-1">
                      {title || meta.label}
                    </p>
                    <p className="text-body text-foreground leading-relaxed">
                      {content}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Support Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + aiResult.recommendations.length * 0.12 }}
          className="rounded-2xl bg-success/5 border border-success/15 p-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <MessageCircleHeart className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-btn font-bold text-success mb-1">
                {isTeacher ? "رسالة دعم" : "رسالة لك 💚"}
              </p>
              <p className="text-body text-foreground/85 leading-relaxed">
                {aiResult.supportive_message}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + aiResult.recommendations.length * 0.12 }}
          className="text-small text-muted-foreground bg-muted/40 rounded-xl p-3 leading-relaxed text-center"
        >
          ⚠️ {isTeacher
            ? "توصيات مبنية على الذكاء الاصطناعي وأدلة وزارة التعليم والأطر التربوية العالمية (OECD, CASEL, UNESCO) وخبرة المرشد الطلابي داخل المدرسة. سيراجعها المرشد الطلابي."
            : "هذي خطوات أولية مبنية على الذكاء الاصطناعي وإرشادات وزارة التعليم وخبرة المرشد الطلابي. بيراجعها المرشد الطلابي."}
        </motion.p>

        {/* Share & Export Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animDelay }}
          className="rounded-2xl bg-card border border-border p-4"
        >
          <p className="text-small font-bold text-foreground/70 mb-3 flex items-center gap-1.5">
            <Share2 className="w-4 h-4" />
            مشاركة وتصدير التوصيات
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleCopy}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/60 hover:bg-muted transition-colors text-center"
            >
              {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5 text-muted-foreground" />}
              <span className="text-small font-medium text-foreground/80">
                {copied ? "تم النسخ" : "نسخ النص"}
              </span>
            </button>
            <button
              onClick={handleExportDocx}
              disabled={exporting}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/60 hover:bg-muted transition-colors text-center disabled:opacity-50"
            >
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="text-small font-medium text-foreground/80">
                {exporting ? "جارٍ..." : "تصدير Word"}
              </span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/60 hover:bg-muted transition-colors text-center"
            >
              <FileDown className="w-5 h-5 text-muted-foreground" />
              <span className="text-small font-medium text-foreground/80">طباعة / PDF</span>
            </button>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animDelay + 0.1 }}
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground text-btn font-bold shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة للرئيسية
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AIRecommendationsView;
