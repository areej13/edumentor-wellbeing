import { motion } from "framer-motion";
import { 
  CheckCircle2, BookOpen, Footprints, Heart, 
  Lightbulb, HandHeart, MessageCircleHeart, ShieldCheck,
  Sparkles, ArrowLeft
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

const stepMeta = [
  { icon: Lightbulb, label: "فهم الموقف", color: "primary" },
  { icon: Footprints, label: "الخطوة الأولى", color: "accent" },
  { icon: Sparkles, label: "خطوة مساعدة", color: "secondary" },
  { icon: HandHeart, label: "تذكير بالدعم", color: "success" },
  { icon: ShieldCheck, label: "خطوة إضافية", color: "primary" },
];

const AIRecommendationsView = ({ aiResult, role }: Props) => {
  const navigate = useNavigate();
  const isTeacher = role === "teacher";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-24 pt-8 sm:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-5"
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
            إليك بعض الخطوات التي قد تساعدك
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
              <span className="text-btn font-bold text-primary">موقف مشابه</span>
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
            const delay = 0.3 + i * 0.1;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay, type: "spring", stiffness: 120, damping: 14 }}
                className="group relative rounded-2xl bg-card border border-border/60 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start gap-3">
                  {/* Step Number + Icon */}
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-xl bg-${meta.color}/10 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${meta.color}`} />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 pt-0.5">
                    <p className="text-small font-semibold text-muted-foreground mb-1">
                      {meta.label}
                    </p>
                    <p className="text-body text-foreground leading-relaxed">
                      {rec}
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
          transition={{ delay: 0.3 + aiResult.recommendations.length * 0.1 }}
          className="rounded-2xl bg-success/5 border border-success/15 p-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <MessageCircleHeart className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-btn font-bold text-success mb-1">رسالة دعم</p>
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
          transition={{ delay: 0.5 + aiResult.recommendations.length * 0.1 }}
          className="text-small text-muted-foreground bg-muted/40 rounded-xl p-3 leading-relaxed text-center"
        >
          ⚠️ {isTeacher
            ? "توصيات مبنية على أدلة وزارة التعليم والأطر التربوية العالمية (OECD, CASEL, UNESCO) وسيراجعها المرشد الطلابي."
            : "توصيات مبنية على أدلة وزارة التعليم السعودية وسيراجعها المرشد الطلابي."}
        </motion.p>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 + aiResult.recommendations.length * 0.1 }}
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
