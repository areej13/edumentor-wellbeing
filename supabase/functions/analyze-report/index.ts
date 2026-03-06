import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { report_text, category, emotion, role } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `أنت مساعد ذكي متخصص في الإرشاد الطلابي في المدارس السعودية. مهمتك تحليل بلاغات الطلاب والمعلمين وتقديم توصيات أولية بناءً على:
- دليل المرشد الطلابي بوزارة التعليم السعودية
- أطر دعم الطلاب والرفاه النفسي
- سياسات حماية الطالب والسلامة المدرسية

قواعد مهمة:
1. قدم 3-5 توصيات عملية ومحددة
2. استخدم لغة داعمة وغير حكمية
3. راعِ الفئة العمرية والسياق المدرسي
4. لا تقدم تشخيصات طبية أو نفسية
5. أكد دائماً أن هذه توصيات أولية سيراجعها المرشد

أجب بصيغة JSON فقط بالشكل التالي:
{
  "recommendations": ["توصية 1", "توصية 2", ...],
  "suggested_category": "التصنيف المقترح",
  "detected_emotion": "المشاعر المكتشفة",
  "severity": "low|medium|high",
  "supportive_message": "رسالة دعم قصيرة للطالب"
}`;

    const userPrompt = `تحليل البلاغ التالي:
- الدور: ${role === "student" ? "طالب" : "معلم"}
- التصنيف المختار: ${category}
- المشاعر المختارة: ${emotion}
- نص البلاغ: ${report_text}

قدم توصيات أولية مناسبة.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد للاستمرار" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      parsed = {
        recommendations: [content],
        suggested_category: category,
        detected_emotion: emotion,
        severity: "medium",
        supportive_message: "نحن هنا لمساعدتك. سيتم مراجعة بلاغك من قبل المرشد الطلابي.",
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-report error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
