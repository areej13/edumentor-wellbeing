import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Fetch knowledge documents relevant to the category
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let knowledgeContext = "";
    const { data: docs } = await supabase
      .from("knowledge_documents")
      .select("title, content, category")
      .limit(10);

    if (docs?.length) {
      // Prioritize docs matching the category
      const sorted = docs.sort((a, b) => {
        const aMatch = a.category === category ? 1 : 0;
        const bMatch = b.category === category ? 1 : 0;
        return bMatch - aMatch;
      });
      knowledgeContext = sorted.map(d => `[${d.title}]\n${d.content.slice(0, 2000)}`).join("\n\n---\n\n");
    }

    // Fetch counselor solutions for similar categories
    let solutionsContext = "";
    const { data: solutions } = await supabase
      .from("counselor_solutions")
      .select("title, content, category, usage_count")
      .eq("is_reusable", true)
      .order("usage_count", { ascending: false })
      .limit(10);

    if (solutions?.length) {
      const relevant = solutions.filter(s => s.category === category || s.category === "أخرى");
      if (relevant.length) {
        solutionsContext = "\n\nحلول إرشادية سابقة معتمدة من المرشد الطلابي:\n" +
          relevant.map(s => `- ${s.title}: ${s.content}`).join("\n");
      }
    }

    const isTeacher = role === "teacher";

    const studentGuidelines = `يجب أن تعتمد بشكل أساسي على الوثائق المرجعية الرسمية من وزارة التعليم السعودية المتوفرة أدناه عند إنشاء التوصيات.
إذا لم تجد إجابة مباشرة في الوثائق المرجعية، يمكنك تقديم توجيهات داعمة عامة مع الإشارة إلى أن التوصية ليست مستمدة مباشرة من الملفات المرجعية الرسمية.`;

    const teacherGuidelines = `يجب أن تقدم توصيات للمعلمين بناءً على:
1. أدلة وزارة التعليم السعودية للإرشاد المدرسي والتوجيه (الأولوية القصوى)
2. إطار OECD لرفاه المعلمين - استراتيجيات إدارة الضغط المهني وتحسين بيئة العمل
3. إطار CASEL للتعلم الاجتماعي والعاطفي - بناء مهارات التواصل والذكاء العاطفي في الصف
4. موارد UNESCO لدعم المعلمين - أفضل الممارسات العالمية في التعليم

مجالات التوصيات للمعلمين تشمل:
- استراتيجيات إدارة الصف الفعالة
- أساليب دعم رفاه الطلاب
- استراتيجيات التواصل مع الطلاب وأولياء الأمور
- معالجة الصعوبات الأكاديمية
- تقليل الضغط المهني والإرهاق
- التعامل مع السلوكيات الصعبة`;

    const systemPrompt = `أنت مساعد ذكي متخصص في الإرشاد ${isTeacher ? "التربوي للمعلمين" : "الطلابي"} في المدارس السعودية. مهمتك تحليل ${isTeacher ? "تقارير المعلمين" : "بلاغات الطلاب"} وتقديم توصيات أولية.

${isTeacher ? teacherGuidelines : studentGuidelines}

${knowledgeContext ? `الوثائق المرجعية الرسمية من وزارة التعليم:\n${knowledgeContext}` : ""}
${solutionsContext}

قواعد مهمة:
1. قدم 3-5 توصيات عملية ومحددة ${isTeacher ? "مناسبة للمعلمين بناءً على أدلة وزارة التعليم والأطر العالمية المعتمدة" : "مستندة على أدلة وزارة التعليم"}
2. استخدم لغة ${isTeacher ? "مهنية وداعمة" : "داعمة وغير حكمية"}
3. ${isTeacher ? "راعِ السياق المهني والتحديات اليومية للمعلم" : "راعِ الفئة العمرية والسياق المدرسي"}
4. لا تقدم تشخيصات طبية أو نفسية
5. أكد دائماً أن هذه توصيات أولية سيراجعها المرشد
6. إذا توفرت حلول إرشادية سابقة مشابهة، استفد منها في التوصيات

أجب بصيغة JSON فقط بالشكل التالي:
{
  "recommendations": ["توصية 1", "توصية 2", ...],
  "suggested_category": "التصنيف المقترح",
  "detected_emotion": "المشاعر المكتشفة",
  "severity": "low|medium|high",
  "supportive_message": "رسالة دعم قصيرة ${isTeacher ? "للمعلم" : "للطالب"}",
  "based_on_official_docs": true
}`;

    const userPrompt = `تحليل ${isTeacher ? "تقرير المعلم" : "بلاغ الطالب"} التالي:
- الدور: ${isTeacher ? "معلم" : "طالب"}
- التصنيف المختار: ${category}
- المشاعر المختارة: ${emotion}
- نص ${isTeacher ? "التقرير" : "البلاغ"}: ${report_text}

قدم توصيات أولية مناسبة ${isTeacher ? "للمعلم بناءً على أدلة وزارة التعليم والأطر التربوية العالمية المعتمدة (OECD, CASEL, UNESCO)" : "مستندة على أدلة وزارة التعليم السعودية"}.`;

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
        based_on_official_docs: false,
      };
    }

    // Increment usage_count for matched solutions
    if (solutions?.length) {
      const matched = solutions.filter(s => s.category === category);
      for (const s of matched) {
        await supabase.from("counselor_solutions").update({ usage_count: s.usage_count + 1 }).eq("title", s.title);
      }
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
