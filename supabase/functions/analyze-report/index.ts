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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let knowledgeContext = "";
    const { data: docs } = await supabase
      .from("knowledge_documents")
      .select("title, content, category")
      .limit(10);

    if (docs?.length) {
      const sorted = docs.sort((a, b) => {
        const aMatch = a.category === category ? 1 : 0;
        const bMatch = b.category === category ? 1 : 0;
        return bMatch - aMatch;
      });
      knowledgeContext = sorted.map(d => `[${d.title}]\n${d.content.slice(0, 2000)}`).join("\n\n---\n\n");
    }

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

    const studentGuidelines = `أنت تتحدث مباشرة إلى طالب. يجب أن تكون لغتك بسيطة جداً ومفهومة لطالب في المرحلة المتوسطة أو الثانوية.

قواعد صياغة الخطوات للطلاب:
- استخدم لغة يومية بسيطة، تجنب المصطلحات المهنية أو الإرشادية
- كل خطوة يجب أن تكون فعلاً بسيطاً يمكن للطالب القيام به بنفسه
- لا تذكر إجراءات داخلية خاصة بالمرشدين أو المعلمين فقط
- اجعل النبرة ودية ومشجعة وغير حُكمية
- الطالب يجب أن يشعر بالدعم وليس بالتقييم

يجب أن تعتمد على الوثائق المرجعية من وزارة التعليم السعودية لكن تحوّل الإرشادات المهنية إلى خطوات بسيطة مناسبة للطالب.
إذا لم تجد إجابة مباشرة في الوثائق، قدم توجيهات داعمة عامة.

هيكل الخطوات المطلوب (5 خطوات بالضبط):
الخطوة 1 - فهم الموقف: رسالة قصيرة تساعد الطالب على فهم ما يمر به بنبرة داعمة
الخطوة 2 - شيء بسيط تقدر تسويه الحين: فعل عملي فوري وسهل
الخطوة 3 - خطوة ثانية تساعدك: فعل عملي إضافي يحسّن الوضع
الخطوة 4 - لا تتردد تطلب مساعدة: تشجيع على التحدث مع شخص يثق به أو المرشد
الخطوة 5 - تذكّر دائماً: رسالة تشجيعية تذكّره أنه ليس وحده`;

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

    const systemPrompt = `أنت مساعد ذكي متخصص في الإرشاد ${isTeacher ? "التربوي للمعلمين" : "الطلابي"} في المدارس السعودية. مهمتك تحليل ${isTeacher ? "تقارير المعلمين" : "بلاغات الطلاب"} وتقديم ${isTeacher ? "توصيات مهنية" : "خطوات بسيطة ومفهومة"}.

${isTeacher ? teacherGuidelines : studentGuidelines}

${knowledgeContext ? `الوثائق المرجعية الرسمية من وزارة التعليم:\n${knowledgeContext}` : ""}
${solutionsContext}

قواعد مهمة:
1. قدم ${isTeacher ? "3-5 توصيات مهنية مناسبة للمعلمين" : "5 خطوات بسيطة ومفهومة للطالب حسب الهيكل المحدد أعلاه"}
2. استخدم لغة ${isTeacher ? "مهنية وداعمة" : "بسيطة يومية كأنك صديق كبير يتحدث مع الطالب"}
3. ${isTeacher ? "راعِ السياق المهني والتحديات اليومية للمعلم" : "راعِ الفئة العمرية - استخدم كلمات يفهمها طالب في المتوسطة أو الثانوية"}
4. لا تقدم تشخيصات طبية أو نفسية
5. أكد دائماً أن هذه توصيات أولية سيراجعها المرشد
6. إذا توفرت حلول إرشادية سابقة مشابهة، استفد منها
7. قدم سيناريو واقعي قصير يوضح الموقف بلغة ${isTeacher ? "مهنية" : "بسيطة ومفهومة للطالب"}

أجب بصيغة JSON فقط بالشكل التالي:
{
  "scenario": "وصف قصير بلغة ${isTeacher ? "مهنية" : "بسيطة"} لموقف مشابه قد يمر به ${isTeacher ? "معلم" : "طالب"} آخر",
  "recommendations": [${isTeacher ? '"توصية مهنية 1", "توصية 2", ...' : '"فهم الموقف - ...", "شيء بسيط تقدر تسويه - ...", "خطوة ثانية تساعدك - ...", "لا تتردد تطلب مساعدة - ...", "تذكّر دائماً - ..."'}],
  "suggested_category": "التصنيف المقترح",
  "detected_emotion": "المشاعر المكتشفة",
  "severity": "low|medium|high",
  "supportive_message": "رسالة دعم تشجيعية ${isTeacher ? "للمعلم" : "للطالب بلغة بسيطة"} توضح أن المساعدة متاحة وأنه ليس وحده",
  "based_on_official_docs": true
}`;

    const userPrompt = `تحليل ${isTeacher ? "تقرير المعلم" : "بلاغ الطالب"} التالي:
- الدور: ${isTeacher ? "معلم" : "طالب"}
- التصنيف المختار: ${category}
- المشاعر المختارة: ${emotion}
- نص ${isTeacher ? "التقرير" : "البلاغ"}: ${report_text}

قدم ${isTeacher ? "توصيات مهنية مناسبة للمعلم بناءً على أدلة وزارة التعليم والأطر التربوية العالمية المعتمدة (OECD, CASEL, UNESCO)" : "5 خطوات بسيطة ومفهومة للطالب تساعده على التعامل مع الموقف، بلغة يومية بسيطة مستندة على أدلة وزارة التعليم السعودية"}.`;

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
