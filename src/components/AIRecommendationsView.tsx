import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AIRecommendation {
  recommendations: string[];
  suggested_category: string;
  detected_emotion: string;
  severity: string;
  supportive_message: string;
}

interface Props {
  aiResult: AIRecommendation;
}

const AIRecommendationsView = ({ aiResult }: Props) => {
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
          <p className="text-body text-muted-foreground">
            {aiResult.supportive_message}
          </p>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-accent/5 border border-accent/20 rounded-lg p-5 mb-4"
        >
          <h3 className="text-title-sub font-bold text-accent mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            توصيات أولية من المرشد الذكي
          </h3>
          <ul className="space-y-2.5 mb-4">
            {aiResult.recommendations.map((rec, i) => (
              <li key={i} className="text-body text-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
          <p className="text-small text-muted-foreground bg-muted/50 rounded-md p-3 leading-relaxed">
            ⚠️ هذه توصيات أولية مبنية على إرشادات تعليمية رسمية وسيتم مراجعتها من قبل المرشد الطلابي.
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
