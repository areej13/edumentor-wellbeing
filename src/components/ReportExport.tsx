import { useState } from "react";
import { FileDown, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

interface Props {
  reports: Report[];
  selectedReport?: Report | null;
}

const ReportExport = ({ reports, selectedReport }: Props) => {
  const [exporting, setExporting] = useState(false);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  const roleLabel = (r: string) => r === "student" ? "طالب" : "معلم";

  const exportDocx = async (single?: Report) => {
    setExporting(true);
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = await import("docx");
      const { saveAs } = await import("file-saver");

      const target = single ? [single] : reports;
      const children: any[] = [];

      // Title
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [new TextRun({ text: single ? "تقرير حالة فردية" : "تقرير شامل - المرشد الذكي", bold: true, size: 32, font: "Arial" })],
      }));
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: `تاريخ التقرير: ${formatDate(new Date().toISOString())}`, size: 22, font: "Arial", color: "666666" })],
      }));

      if (!single) {
        // Summary stats
        const total = reports.length;
        const newR = reports.filter(r => r.status === "جديد").length;
        const inRev = reports.filter(r => r.status === "قيد المراجعة").length;
        const done = reports.filter(r => r.status === "تمت المعالجة").length;

        const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
        const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

        children.push(new Paragraph({
          spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: "ملخص الإحصائيات", bold: true, size: 26, font: "Arial" })],
        }));

        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ borders, width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `إجمالي: ${total}`, size: 22, font: "Arial" })] })] }),
                new TableCell({ borders, width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `جديد: ${newR}`, size: 22, font: "Arial" })] })] }),
                new TableCell({ borders, width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `قيد المراجعة: ${inRev}`, size: 22, font: "Arial" })] })] }),
                new TableCell({ borders, width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `تمت المعالجة: ${done}`, size: 22, font: "Arial" })] })] }),
              ],
            }),
          ],
        }));

        // Category breakdown
        const cats: Record<string, number> = {};
        reports.forEach(r => { cats[r.category] = (cats[r.category] || 0) + 1; });
        children.push(new Paragraph({ spacing: { before: 300, after: 100 }, children: [new TextRun({ text: "التوزيع حسب التصنيف", bold: true, size: 24, font: "Arial" })] }));
        Object.entries(cats).forEach(([cat, count]) => {
          children.push(new Paragraph({ spacing: { after: 50 }, children: [new TextRun({ text: `• ${cat}: ${count} بلاغ`, size: 22, font: "Arial" })] }));
        });

        children.push(new Paragraph({ spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "تفاصيل البلاغات", bold: true, size: 26, font: "Arial" })] }));
      }

      target.forEach((r, i) => {
        if (!single && i > 0) {
          children.push(new Paragraph({ spacing: { before: 300 }, children: [] }));
        }
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: `${single ? "" : `بلاغ #${i + 1}: `}${r.category}`, bold: true, size: 24, font: "Arial" })],
        }));
        children.push(new Paragraph({ spacing: { after: 50 }, children: [new TextRun({ text: `الدور: ${roleLabel(r.role)} | الحالة: ${r.status} | التاريخ: ${formatDate(r.created_at)}`, size: 20, font: "Arial", color: "666666" })] }));
        if (r.emotion) children.push(new Paragraph({ spacing: { after: 50 }, children: [new TextRun({ text: `المشاعر: ${r.emotion}`, size: 20, font: "Arial" })] }));
        children.push(new Paragraph({ spacing: { before: 100, after: 100 }, children: [new TextRun({ text: `نص البلاغ: ${r.report_text}`, size: 22, font: "Arial" })] }));

        if (r.ai_recommendations?.length) {
          children.push(new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "توصيات الذكاء الاصطناعي:", bold: true, size: 22, font: "Arial" })] }));
          r.ai_recommendations.forEach(rec => {
            children.push(new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: `  • ${rec}`, size: 20, font: "Arial" })] }));
          });
        }
        if (r.counselor_notes) {
          children.push(new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: `ملاحظات المرشد: ${r.counselor_notes}`, size: 22, font: "Arial", italics: true })] }));
        }
        if (r.counselor_recommendation) {
          children.push(new Paragraph({ spacing: { before: 50 }, children: [new TextRun({ text: `توصية المرشد: ${r.counselor_recommendation}`, size: 22, font: "Arial", bold: true })] }));
        }
      });

      // Footer
      children.push(new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "المرشد الذكي - EDUMENTOR AI | تم إنشاؤه تلقائياً", size: 18, font: "Arial", color: "999999" })] }));

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, single ? `تقرير-حالة-${single.id.slice(0, 8)}.docx` : "تقرير-شامل-المرشد-الذكي.docx");
      toast.success("تم تصدير التقرير بنجاح");
    } catch (e) {
      console.error(e);
      toast.error("خطأ في تصدير التقرير");
    }
    setExporting(false);
  };

  const printReport = (single?: Report) => {
    const target = single ? [single] : reports;
    const total = reports.length;
    const newR = reports.filter(r => r.status === "جديد").length;
    const inRev = reports.filter(r => r.status === "قيد المراجعة").length;
    const done = reports.filter(r => r.status === "تمت المعالجة").length;

    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${single ? "تقرير حالة" : "تقرير شامل"}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,sans-serif;padding:30px;color:#222;font-size:14px;line-height:1.7}
      h1{text-align:center;color:#1a3a6b;margin-bottom:5px;font-size:22px}
      .date{text-align:center;color:#888;margin-bottom:25px;font-size:13px}
      .stats{display:flex;gap:15px;margin-bottom:25px;flex-wrap:wrap}
      .stat{flex:1;min-width:120px;background:#f0f4ff;border-radius:8px;padding:12px;text-align:center}
      .stat .num{font-size:22px;font-weight:bold;color:#1a3a6b}
      .stat .lbl{font-size:12px;color:#666}
      .report{border:1px solid #e0e0e0;border-radius:8px;padding:15px;margin-bottom:15px;page-break-inside:avoid}
      .report h3{color:#1a3a6b;margin-bottom:8px}
      .meta{color:#888;font-size:12px;margin-bottom:8px}
      .text{background:#f9f9f9;padding:10px;border-radius:6px;margin-bottom:10px}
      .ai{background:#f0f4ff;padding:10px;border-radius:6px;margin-bottom:8px}
      .ai h4{color:#6366f1;margin-bottom:5px;font-size:13px}
      .ai li{margin-right:15px;font-size:13px}
      .note{color:#555;font-style:italic;font-size:13px}
      .footer{text-align:center;color:#aaa;font-size:11px;margin-top:30px;border-top:1px solid #eee;padding-top:10px}
      @media print{body{padding:15px}.stats{gap:8px}}
    </style></head><body>
    <h1>المرشد الذكي - EDUMENTOR AI</h1>
    <p class="date">${single ? "تقرير حالة فردية" : "تقرير شامل"} | ${formatDate(new Date().toISOString())}</p>
    ${!single ? `<div class="stats">
      <div class="stat"><div class="num">${total}</div><div class="lbl">إجمالي</div></div>
      <div class="stat"><div class="num">${newR}</div><div class="lbl">جديد</div></div>
      <div class="stat"><div class="num">${inRev}</div><div class="lbl">قيد المراجعة</div></div>
      <div class="stat"><div class="num">${done}</div><div class="lbl">تمت المعالجة</div></div>
    </div>` : ""}
    ${target.map((r, i) => `
      <div class="report">
        <h3>${single ? "" : `#${i + 1} - `}${r.category}</h3>
        <p class="meta">${roleLabel(r.role)} | ${r.status} | ${formatDate(r.created_at)}${r.emotion ? ` | ${r.emotion}` : ""}</p>
        <div class="text">${r.report_text}</div>
        ${r.ai_recommendations?.length ? `<div class="ai"><h4>توصيات الذكاء الاصطناعي:</h4><ul>${r.ai_recommendations.map(rec => `<li>${rec}</li>`).join("")}</ul></div>` : ""}
        ${r.counselor_notes ? `<p class="note">ملاحظات المرشد: ${r.counselor_notes}</p>` : ""}
        ${r.counselor_recommendation ? `<p class="note"><b>توصية المرشد: ${r.counselor_recommendation}</b></p>` : ""}
      </div>
    `).join("")}
    <p class="footer">تم إنشاؤه تلقائياً بواسطة المرشد الذكي - EDUMENTOR AI</p>
    </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {selectedReport ? (
        <>
          <Button variant="outline" size="sm" onClick={() => exportDocx(selectedReport)} disabled={exporting} className="gap-1">
            <FileText className="w-4 h-4" /> تصدير Word
          </Button>
          <Button variant="outline" size="sm" onClick={() => printReport(selectedReport)} className="gap-1">
            <Printer className="w-4 h-4" /> طباعة
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" size="sm" onClick={() => exportDocx()} disabled={exporting} className="gap-1">
            <FileDown className="w-4 h-4" /> {exporting ? "جارٍ التصدير..." : "تصدير Word شامل"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => printReport()} className="gap-1">
            <Printer className="w-4 h-4" /> طباعة شاملة
          </Button>
        </>
      )}
    </div>
  );
};

export default ReportExport;
