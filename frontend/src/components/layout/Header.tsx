import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Bell,
  User,
  Moon,
  Sun,
  PenSquare,
  MoreHorizontal,
  LogOut,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("pulsar_theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return document.documentElement.classList.contains("dark");
  });
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    // Apply saved theme on mount
    const savedTheme = localStorage.getItem("pulsar_theme");
    if (savedTheme) {
      const isDarkMode = savedTheme === "dark";
      setIsDark(isDarkMode);
      document.documentElement.classList.toggle("dark", isDarkMode);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    // Save to localStorage
    localStorage.setItem("pulsar_theme", newIsDark ? "dark" : "light");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { path: "/", icon: Home, label: "الرئيسية" },
    { path: "/explore", icon: Search, label: "استكشاف" },
    { path: "/notifications", icon: Bell, label: "الإشعارات" },
    { path: "/profile", icon: User, label: "الملف الشخصي" },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold tracking-tight">
            نبض
          </Link>

          {/* Navigation - Desktop */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-surface-hover ${
                  location.pathname === path
                    ? "font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-24 truncate">
                      {user?.displayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/compose" className="gap-2">
                      <PenSquare className="h-4 w-4" />
                      نشر
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>دخول</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`p-3 transition-colors ${
                location.pathname === path
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
            </Link>
          ))}
          <Link to="/compose" className="p-3 text-muted-foreground">
            <PenSquare className="h-5 w-5" />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-3 text-muted-foreground">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mb-2">
              <DropdownMenuItem onClick={toggleTheme} className="gap-2">
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span>{isDark ? "الوضع النهاري" : "الوضع الليلي"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isLoggedIn ? (
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/auth" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    تسجيل الدخول
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
};

export default Header;
