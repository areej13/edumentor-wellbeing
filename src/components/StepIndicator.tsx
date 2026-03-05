import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <motion.div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-small font-bold transition-colors duration-200
              ${isCompleted ? "bg-success text-success-foreground" : ""}
              ${isActive ? "bg-primary text-primary-foreground" : ""}
              ${!isActive && !isCompleted ? "bg-muted text-muted-foreground" : ""}
            `}
            animate={{ scale: isActive ? 1.15 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {isCompleted ? <Check className="w-4 h-4" /> : step}
          </motion.div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
