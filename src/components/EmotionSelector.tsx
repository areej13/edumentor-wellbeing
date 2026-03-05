import { motion } from "framer-motion";

const emotions = [
  { label: "قلق", emoji: "😟" },
  { label: "حزين", emoji: "😢" },
  { label: "غاضب", emoji: "😠" },
  { label: "مشتت", emoji: "😵‍💫" },
  { label: "مرهق", emoji: "😩" },
  { label: "محايد", emoji: "😐" },
  { label: "محتار", emoji: "🤔" },
];

interface EmotionSelectorProps {
  selected: string | null;
  onSelect: (emotion: string) => void;
}

const EmotionSelector = ({ selected, onSelect }: EmotionSelectorProps) => {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
      {emotions.map((emotion, i) => (
        <motion.button
          key={emotion.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          onClick={() => onSelect(emotion.label)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors duration-200 cursor-pointer
            ${selected === emotion.label
              ? "border-accent bg-accent/10"
              : "border-border bg-card hover:border-primary/30"
            }`}
        >
          <span className="text-2xl">{emotion.emoji}</span>
          <span className="text-small font-medium">{emotion.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default EmotionSelector;
