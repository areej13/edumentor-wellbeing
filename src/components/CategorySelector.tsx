import { motion } from "framer-motion";
import { Brain, Users, BookOpen, AlertTriangle, Settings, Building, Lightbulb, MoreHorizontal, UserCheck, MessageCircle, Briefcase, HeartPulse } from "lucide-react";

const studentCategories = [
  { label: "نفسية", icon: Brain },
  { label: "اجتماعية", icon: Users },
  { label: "أكاديمية", icon: BookOpen },
  { label: "سلوكية", icon: AlertTriangle },
  { label: "إدارية", icon: Settings },
  { label: "مرافق وتجهيزات", icon: Building },
  { label: "اقتراح تطويري", icon: Lightbulb },
  { label: "أخرى", icon: MoreHorizontal },
];

const teacherCategories = [
  { label: "إدارة الصف", icon: Users },
  { label: "سلوك الطلاب", icon: AlertTriangle },
  { label: "صعوبات أكاديمية", icon: BookOpen },
  { label: "عبء العمل", icon: Briefcase },
  { label: "تحديات التواصل", icon: MessageCircle },
  { label: "البيئة المدرسية", icon: Building },
  { label: "الدعم النفسي للمعلم", icon: HeartPulse },
  { label: "اقتراح تطويري", icon: Lightbulb },
  { label: "أخرى", icon: MoreHorizontal },
];

interface CategorySelectorProps {
  selected: string | null;
  onSelect: (category: string) => void;
  role?: string | null;
}

const CategorySelector = ({ selected, onSelect, role }: CategorySelectorProps) => {
  const categories = role === "teacher" ? teacherCategories : studentCategories;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {categories.map((cat, i) => {
        const Icon = cat.icon;
        return (
          <motion.button
            key={cat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            onClick={() => onSelect(cat.label)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors duration-200 cursor-pointer
              ${selected === cat.label
                ? "border-accent bg-accent/10"
                : "border-border bg-card hover:border-primary/30"
              }`}
          >
            <Icon className={`w-6 h-6 ${selected === cat.label ? "text-accent" : "text-primary"}`} />
            <span className="text-btn font-medium text-center">{cat.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategorySelector;
