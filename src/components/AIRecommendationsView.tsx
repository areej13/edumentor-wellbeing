import { motion } from "framer-motion";
import { 
  CheckCircle2, BookOpen, Footprints, Heart, 
  Lightbulb, HandHeart, MessageCircleHeart, ShieldCheck,
  Sparkles, ArrowLeft, Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  // Parse step title from recommendation text (format: "title - content")
  const parseStep = (rec: string) => {
    const dashIndex = rec.indexOf(" - ");
    if (dashIndex > 0 && dashIndex < 30) {
      return { title: rec.slice(0, dashIndex), content: rec.slice(dashIndex + 3) };
    }
    return { title: null, content: rec };
  };

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
                  {/* Step Icon */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-card/80 shadow-sm flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${meta.iconColor}`} />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow-sm">
                      {i + 1}
                    </span>
                  </div>

                  {/* Content */}
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
            ? "توصيات مبنية على أدلة وزارة التعليم والأطر التربوية العالمية (OECD, CASEL, UNESCO) وسيراجعها المرشد الطلابي."
            : "هذي خطوات أولية مبنية على إرشادات وزارة التعليم وبيراجعها المرشد الطلابي."}
        </motion.p>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 + aiResult.recommendations.length * 0.12 }}
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
