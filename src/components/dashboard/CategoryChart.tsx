import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Report {
  category: string;
}

interface CategoryChartProps {
  reports: Report[];
  title: string;
}

const CategoryChart = ({ reports, title }: CategoryChartProps) => {
  const categoryCounts: Record<string, number> = {};
  reports.forEach(r => { categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1; });
  const data = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

  if (data.length === 0) return null;

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
      <h3 className="text-title-sub font-bold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "Tajawal" }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ fontFamily: "Tajawal", fontSize: 13 }} />
          <Bar dataKey="count" fill="hsl(224,64%,33%)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
