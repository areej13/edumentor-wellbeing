import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isCounselor, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!isCounselor) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <h2 className="text-title-section font-bold text-destructive mb-2">غير مصرح</h2>
          <p className="text-body text-muted-foreground">ليس لديك صلاحية للوصول إلى لوحة المرشد.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
