import { motion } from "framer-motion";
import { Shield, Lock, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-20 sm:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg w-full"
      >
        {/* Logo */}
        <motion.div
          className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-primary flex items-center justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        {/* Title */}
        <h1 className="text-title-main font-bold text-primary mb-2">المرشد الذكي</h1>
        <p className="text-body text-muted-foreground mb-1 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-accent" />
          EDUMENTOR AI
        </p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-title-sub font-semibold text-secondary mt-6 mb-3"
        >
          صوتك يخلق فرقاً
        </motion.p>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-small text-muted-foreground bg-muted px-4 py-3 rounded-lg mb-8"
        >
          <Lock className="w-4 h-4 shrink-0" />
          <span>جميع البيانات سرية وتستخدم فقط لتحسين البيئة التعليمية.</span>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/report")}
          className="w-full py-4 px-6 rounded-lg bg-primary text-primary-foreground text-body font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow duration-200"
        >
          تقديم بلاغ أو طلب دعم
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Index;
