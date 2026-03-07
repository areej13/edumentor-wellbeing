import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Mic, MicOff, Send, Loader2, User, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import StepIndicator from "@/components/StepIndicator";
import CategorySelector from "@/components/CategorySelector";
import EmotionSelector from "@/components/EmotionSelector";
import AIRecommendationsView from "@/components/AIRecommendationsView";

const studentSuggestions = [
  "هل تواجه صعوبة في فهم الدروس؟",
  "هل تشعر بالضغط بسبب الواجبات؟",
  "هل تعرضت للتنمر؟",
  "هل لديك مشكلة مع أحد في المدرسة؟",
  "هل تحتاج إلى مساعدة أو دعم؟",
];

const teacherSuggestions = [
  "أواجه صعوبة في إدارة الصف الدراسي",
  "أحتاج استراتيجيات للتعامل مع سلوك طالب",
  "أشعر بضغط العمل وعبء المهام",
  "أحتاج دعم في التواصل مع أولياء الأمور",
  "أبحث عن طرق لتحسين البيئة الصفية",
  "أحتاج مساعدة في دعم طالب يعاني نفسياً",
];

const educationLevels = [
  { label: "ابتدائي", value: "primary" },
  { label: "متوسط", value: "middle" },
  { label: "ثانوي", value: "secondary" },
];

const pageVariants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
};

interface AIResult {
  recommendations: string[];
  suggested_category: string;
  detected_emotion: string;
  severity: string;
  supportive_message: string;
}

const SubmitReport = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [reportText, setReportText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);

  // Teachers skip education level step
  const isTeacher = role === "teacher";
  const steps = isTeacher
    ? ["role", "category", "emotion", "text"]
    : ["role", "level", "category", "emotion", "text"];
  const totalSteps = steps.length;
  const currentStepName = steps[step - 1];

  const canNext = () => {
    switch (currentStepName) {
      case "role": return !!role;
      case "level": return !!level;
      case "category": return !!category;
      case "emotion": return !!emotion;
      case "text": return reportText.trim().length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Generate ID client-side for reference
      const reportId = crypto.randomUUID();

      // Save report to database
      const { error: insertError } = await supabase
        .from("reports")
        .insert({
          id: reportId,
          role: role!,
          education_level: level,
          category: category!,
          emotion,
          report_text: reportText,
        });

      if (insertError) throw insertError;

      // Call AI analysis
      const aiResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            report_text: reportText,
            category,
            emotion,
            role,
          }),
        }
      );

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        setAiResult(aiData);

        // Update report with AI recommendations
        await supabase
          .from("reports")
          .update({
            ai_recommendations: aiData.recommendations,
            ai_category_suggestion: aiData.suggested_category,
            ai_emotion_detected: aiData.detected_emotion,
          })
          .eq("id", reportId);
      } else {
        // Still show success even if AI fails
        setAiResult({
          recommendations: ["سيتم مراجعة بلاغك من قبل المرشد الطلابي في أقرب وقت."],
          suggested_category: category!,
          detected_emotion: emotion || "",
          severity: "medium",
          supportive_message: "شكراً لمساهمتك. تم استلام بلاغك بنجاح.",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "ar-SA";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setReportText((prev) => (prev ? prev + " " + transcript : transcript));
      };
      recognition.onend = () => setIsRecording(false);
      recognition.start();
      setIsRecording(true);
    } else {
      setIsRecording(false);
    }
  };

  // Show AI recommendations after submission
  if (aiResult) {
    return <AIRecommendationsView aiResult={aiResult} role={role} />;
  }

  // Show loading state during submission
  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
          <p className="text-title-sub font-bold text-primary mb-2">جارٍ تحليل البلاغ...</p>
          <p className="text-body text-muted-foreground">يقوم المرشد الذكي بتحليل بلاغك وتقديم توصيات أولية</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-6 pb-24 sm:pb-8">
      <div className="w-full max-w-lg">
        <StepIndicator currentStep={step} totalSteps={totalSteps} />

        <AnimatePresence mode="wait">
          {/* Step 1: Role */}
          {step === 1 && (
            <motion.div key="role" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
              <h2 className="text-title-section font-bold text-center mb-2">من أنت؟</h2>
              <p className="text-body text-muted-foreground text-center mb-6">اختر نوع المستخدم</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "طالب", value: "student", icon: GraduationCap },
                  { label: "معلم", value: "teacher", icon: User },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      onClick={() => setRole(item.value)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-colors duration-200
                        ${role === item.value ? "border-accent bg-accent/10" : "border-border bg-card hover:border-primary/30"}`}
                    >
                      <Icon className={`w-10 h-10 ${role === item.value ? "text-accent" : "text-primary"}`} />
                      <span className="text-body font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Level */}
          {step === 2 && (
            <motion.div key="level" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
              <h2 className="text-title-section font-bold text-center mb-2">المرحلة الدراسية</h2>
              <p className="text-body text-muted-foreground text-center mb-6">اختر المرحلة</p>
              <div className="flex flex-col gap-3">
                {educationLevels.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    className={`p-4 rounded-lg border-2 text-body font-medium text-center transition-colors duration-200
                      ${level === l.value ? "border-accent bg-accent/10" : "border-border bg-card hover:border-primary/30"}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Category */}
          {step === 3 && (
            <motion.div key="category" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
              <h2 className="text-title-section font-bold text-center mb-2">نوع البلاغ</h2>
              <p className="text-body text-muted-foreground text-center mb-6">اختر التصنيف المناسب</p>
              <CategorySelector selected={category} onSelect={setCategory} role={role} />
            </motion.div>
          )}

          {/* Step 4: Emotion */}
          {step === 4 && (
            <motion.div key="emotion" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
              <h2 className="text-title-section font-bold text-center mb-2">كيف تشعر؟</h2>
              <p className="text-body text-muted-foreground text-center mb-6">اختر المشاعر التي تعبر عنك</p>
              <EmotionSelector selected={emotion} onSelect={setEmotion} />
            </motion.div>
          )}

          {/* Step 5: Report Text */}
          {step === 5 && (
            <motion.div key="text" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
              <h2 className="text-title-section font-bold text-center mb-2">وصف المشكلة</h2>
              <p className="text-body text-muted-foreground text-center mb-4">اكتب أو تحدث عن مشكلتك</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {(role === "teacher" ? teacherSuggestions : studentSuggestions).map((s) => (
                  <button
                    key={s}
                    onClick={() => setReportText((prev) => (prev ? prev + " " + s : s))}
                    className="px-3 py-1.5 rounded-full bg-muted text-small text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="relative">
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="اكتب هنا أو استخدم المايكروفون..."
                  rows={5}
                  className="w-full p-4 rounded-lg border-2 border-border bg-card text-body resize-none focus:outline-none focus:border-accent transition-colors duration-200"
                />
                <button
                  onClick={toggleRecording}
                  className={`absolute bottom-3 left-3 p-2.5 rounded-full transition-colors duration-200
                    ${isRecording ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 gap-3">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-border text-btn font-medium hover:bg-muted transition-colors duration-200"
            >
              <ArrowRight className="w-4 h-4" />
              السابق
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-btn font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-200"
          >
            {step === totalSteps ? (
              <>
                إرسال
                <Send className="w-4 h-4" />
              </>
            ) : (
              <>
                التالي
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitReport;
