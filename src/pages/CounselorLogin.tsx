import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, LogIn, Sparkles, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CounselorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          setError(error.message);
        } else {
          setError("");
          setIsSignUp(false);
          // Show success message
          setError("تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول.");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message?.includes("Email not confirmed")) {
            setError("لم يتم تأكيد البريد الإلكتروني بعد. يرجى التحقق من بريدك الإلكتروني.");
          } else {
            setError("بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.");
          }
        } else {
          navigate("/dashboard");
        }
      }
    } catch {
      setError("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-20 sm:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary flex items-center justify-center"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shield className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-title-section font-bold text-primary mb-1">المرشد الذكي</h1>
          <p className="text-small text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-accent" />
            EDUMENTOR AI
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl border border-border shadow-lg p-6">
          <h2 className="text-title-sub font-bold text-foreground text-center mb-2">
            {isSignUp ? "إنشاء حساب مرشد" : "لوحة تحكم المرشد الطلابي"}
          </h2>
          <p className="text-small text-muted-foreground text-center mb-6">
            {isSignUp
              ? "أنشئ حسابك للوصول إلى لوحة التحكم."
              : "الرجاء إدخال بيانات الدخول للوصول إلى البلاغات وإدارة الحالات بسرية وأمان."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-btn font-medium text-foreground mb-1.5 block">الاسم الكامل</label>
                <Input
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="text-right"
                />
              </div>
            )}

            <div>
              <label className="text-btn font-medium text-foreground mb-1.5 block">البريد الإلكتروني</label>
              <Input
                type="email"
                placeholder="أدخل البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-right"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-btn font-medium text-foreground mb-1.5 block">كلمة المرور</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="text-right pl-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-small p-3 rounded-lg bg-destructive/10 text-destructive"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-body font-bold gap-2"
            >
              {isLoading ? (
                <span className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {isSignUp ? "إنشاء الحساب" : "تسجيل الدخول"}
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-small text-accent hover:underline transition-colors"
            >
              {isSignUp ? "لديك حساب؟ تسجيل الدخول" : "ليس لديك حساب؟ إنشاء حساب جديد"}
            </button>
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-center text-small text-muted-foreground mt-4">
          جميع البيانات محمية ومشفرة بالكامل.
        </p>
      </motion.div>
    </div>
  );
};

export default CounselorLogin;
