import { useState, useEffect } from "react";
import { BookOpen, Plus, Edit2, Save, X, Tag, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  "نفسية", "اجتماعية", "أكاديمية", "سلوكية",
  "إدارية", "مرافق وتجهيزات", "اقتراح تطويري", "أخرى",
];

interface Solution {
  id: string;
  title: string;
  content: string;
  category: string;
  is_reusable: boolean;
  usage_count: number;
  created_at: string;
}

const SolutionsLibrary = () => {
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("الكل");
  const [form, setForm] = useState({ title: "", content: "", category: CATEGORIES[0], is_reusable: true });
  const [saving, setSaving] = useState(false);

  const fetchSolutions = async () => {
    const { data, error } = await supabase
      .from("counselor_solutions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast.error("خطأ في تحميل الحلول");
    } else {
      setSolutions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSolutions(); }, []);

  const resetForm = () => {
    setForm({ title: "", content: "", category: CATEGORIES[0], is_reusable: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("counselor_solutions")
        .update({ title: form.title, content: form.content, category: form.category, is_reusable: form.is_reusable })
        .eq("id", editingId);
      if (error) toast.error("خطأ في التحديث");
      else { toast.success("تم تحديث الحل بنجاح"); resetForm(); fetchSolutions(); }
    } else {
      const { error } = await supabase
        .from("counselor_solutions")
        .insert({ title: form.title, content: form.content, category: form.category, is_reusable: form.is_reusable, counselor_id: user?.id });
      if (error) { console.error(error); toast.error("خطأ في الإضافة"); }
      else { toast.success("تم إضافة الحل بنجاح"); resetForm(); fetchSolutions(); }
    }
    setSaving(false);
  };

  const startEdit = (s: Solution) => {
    setForm({ title: s.title, content: s.content, category: s.category, is_reusable: s.is_reusable });
    setEditingId(s.id);
    setShowForm(true);
  };

  const filtered = solutions.filter(s => filterCat === "الكل" || s.category === filterCat);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-title-sub font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          مكتبة الحلول الإرشادية ({solutions.length})
        </h3>
        <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> إضافة حل جديد
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-btn font-bold">{editingId ? "تعديل الحل" : "إضافة حل جديد"}</h4>
            <button onClick={resetForm} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
          </div>
          <Input placeholder="عنوان الحل" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="text-right" />
          <textarea
            placeholder="محتوى الحل / التوصية..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={4}
            className="w-full p-3 rounded-lg border border-border bg-card text-body resize-none"
          />
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="p-2 rounded-lg border border-border bg-card text-small"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-2 text-small cursor-pointer">
              <input type="checkbox" checked={form.is_reusable} onChange={e => setForm(f => ({ ...f, is_reusable: e.target.checked }))} className="rounded" />
              قابل لإعادة الاستخدام
            </label>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-1">
            <Save className="w-4 h-4" /> {saving ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["الكل", ...CATEGORIES].map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1 rounded-full text-small font-medium transition-colors ${filterCat === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Solutions List */}
      {loading ? (
        <p className="text-center text-muted-foreground py-6">جارٍ التحميل...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-6">لا توجد حلول بعد</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <div key={s.id} className="bg-muted/50 rounded-lg p-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-btn font-bold">{s.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-small flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {s.category}
                  </span>
                  {s.is_reusable && (
                    <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-small flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> قابل للتكرار
                    </span>
                  )}
                  {s.usage_count > 0 && (
                    <span className="text-small text-muted-foreground">استخدم {s.usage_count} مرة</span>
                  )}
                </div>
                <p className="text-small text-foreground/80 whitespace-pre-line">{s.content}</p>
              </div>
              <button onClick={() => startEdit(s)} className="p-2 rounded-lg hover:bg-muted shrink-0">
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolutionsLibrary;
