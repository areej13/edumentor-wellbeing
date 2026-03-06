import { Home, FileText, LayoutDashboard, Shield, LogIn, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, signOut } = useAuth();

  const navItems = [
    { label: "الرئيسية", icon: Home, path: "/" },
    { label: "تقديم بلاغ", icon: FileText, path: "/report" },
    ...(session
      ? [{ label: "لوحة المرشد", icon: LayoutDashboard, path: "/dashboard" }]
      : [{ label: "دخول المرشد", icon: LogIn, path: "/login" }]),
  ];

  return (
    <header className="hidden sm:block sticky top-0 bg-card/80 backdrop-blur-md border-b border-border z-50">
      <div className="container flex items-center justify-between h-16">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" />
          <span className="text-title-sub font-bold text-primary">المرشد الذكي</span>
        </button>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-btn font-medium transition-colors duration-200
                  ${isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          {session && (
            <button
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-btn font-medium text-destructive hover:bg-destructive/10 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default TopNav;
