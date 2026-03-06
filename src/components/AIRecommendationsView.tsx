import { motion } from "framer-motion";
import { Brain, CheckCircle2, BookOpen, Footprints, Heart } from "lucide-react";
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

const AIRecommendationsView = ({ aiResult, role }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-20 sm:pb-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="text-center mb-6"
        >
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-title-section font-bold text-primary mb-2">
            تم استلام بلاغك بسرية تامة
          </h2>
        </motion.div>

        {/* Scenario Section */}
        {aiResult.scenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-primary/5 border border-primary/20 rounded-lg p-5 mb-4"
          >
            <h3 className="text-title-sub font-bold text-primary mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              سيناريو مشابه
            </h3>
            <p className="text-body text-foreground/90 leading-relaxed">{aiResult.scenario}</p>
          </motion.div>
        )}

        {/* Recommended Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-accent/5 border border-accent/20 rounded-lg p-5 mb-4"
        >
          <h3 className="text-title-sub font-bold text-accent mb-3 flex items-center gap-2">
            <Footprints className="w-5 h-5" />
            خطوات مقترحة
          </h3>
          <ul className="space-y-2.5 mb-4">
            {aiResult.recommendations.map((rec, i) => (
              <li key={i} className="text-body text-foreground flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-small font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Support Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-success/5 border border-success/20 rounded-lg p-5 mb-4"
        >
          <h3 className="text-title-sub font-bold text-success mb-2 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            رسالة دعم
          </h3>
          <p className="text-body text-foreground/90 leading-relaxed">{aiResult.supportive_message}</p>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-small text-muted-foreground bg-muted/50 rounded-md p-3 leading-relaxed mb-4">
            ⚠️ {role === "teacher"
              ? "هذه التوصيات مبنية على الأدلة الرسمية لوزارة التعليم والأطر التربوية العالمية المعتمدة (OECD, CASEL, UNESCO) وسيتم مراجعتها من قبل المرشد الطلابي."
              : "هذه التوصيات مبنية على الأدلة الرسمية لوزارة التعليم في المملكة العربية السعودية وسيتم مراجعتها من قبل المرشد الطلابي."}
          </p>
        </motion.div>

        <button
          onClick={() => navigate("/")}
          className="w-full px-8 py-3 rounded-lg bg-primary text-primary-foreground text-btn font-bold"
        >
          العودة للرئيسية
        </button>
      </motion.div>
    </div>
  );
};

export default AIRecommendationsView;
