import { motion } from "framer-motion";
import { FileText, AlertTriangle, Brain, TrendingUp } from "lucide-react";

interface Report {
  id: string;
  status: string;
}

interface DashboardStatsProps {
  reports: Report[];
  label?: string;
}

const DashboardStats = ({ reports, label }: DashboardStatsProps) => {
  const total = reports.length;
  const newCount = reports.filter(r => r.status === "جديد").length;
  const inReview = reports.filter(r => r.status === "قيد المراجعة").length;
  const resolved = reports.filter(r => r.status === "تمت المعالجة").length;

  const stats = [
    { label: "إجمالي البلاغات", value: total, icon: FileText, color: "text-primary" },
    { label: "بلاغات جديدة", value: newCount, icon: AlertTriangle, color: "text-warning" },
    { label: "قيد المراجعة", value: inReview, icon: Brain, color: "text-accent" },
    { label: "تمت المعالجة", value: resolved, icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div>
      {label && <h3 className="text-btn font-bold text-muted-foreground mb-2">{label}</h3>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-lg p-4 border border-border shadow-sm"
            >
              <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-title-section font-bold">{stat.value}</p>
              <p className="text-small text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardStats;
