import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Moon, Sun, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  usernameSchema,
  emailSchema,
  passwordSchema,
  displayNameSchema,
} from "@/lib/validations";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then fallback to document class
    const savedTheme = localStorage.getItem("pulsar_theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return document.documentElement.classList.contains("dark");
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  // Form fields
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    // Save to localStorage
    localStorage.setItem("pulsar_theme", newIsDark ? "dark" : "light");
  };

  const validateUsername = (value: string) => {
    const result = usernameSchema.safeParse(value);
    if (!result.success) {
      return result.error.errors[0].message;
    }
    return "";
  };

  const handleUsernameChange = (value: string) => {
    // Only allow valid characters
    const cleaned = value.replace(/[^a-zA-Z0-9_]/g, "");
    setUsername(cleaned);

    if (cleaned) {
      const error = validateUsername(cleaned);
      setErrors((prev) => ({ ...prev, username: error }));
    } else {
      setErrors((prev) => ({ ...prev, username: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login validation
        if (!emailOrUsername.trim()) {
          setErrors({ emailOrUsername: "أدخل البريد أو اسم المستخدم" });
          setIsLoading(false);
          return;
        }

        const passwordResult = passwordSchema.safeParse(password);
        if (!passwordResult.success) {
          setErrors({ password: passwordResult.error.errors[0].message });
          setIsLoading(false);
          return;
        }

        const result = await login(emailOrUsername.trim(), password);
        if (result.success) {
          toast.success("تم تسجيل الدخول بنجاح");
          navigate("/");
        } else {
          toast.error(result.error || "فشل تسجيل الدخول");
        }
      } else {
        // Signup validation
        const validationErrors: Record<string, string> = {};

        const displayNameResult = displayNameSchema.safeParse(displayName);
        if (!displayNameResult.success) {
          validationErrors.displayName =
            displayNameResult.error.errors[0].message;
        }

        const usernameResult = usernameSchema.safeParse(username);
        if (!usernameResult.success) {
          validationErrors.username = usernameResult.error.errors[0].message;
        }

        const emailResult = emailSchema.safeParse(email);
        if (!emailResult.success) {
          validationErrors.email = emailResult.error.errors[0].message;
        }

        const passwordResult = passwordSchema.safeParse(password);
        if (!passwordResult.success) {
          validationErrors.password = passwordResult.error.errors[0].message;
        }

        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setIsLoading(false);
          return;
        }

        const result = await signup({
          email: email.trim(),
          username: username.trim(),
          displayName: displayName.trim(),
          password,
        });

        if (result.success) {
          toast.success("تم إنشاء الحساب بنجاح");
          navigate("/");
        } else {
          toast.error(result.error || "فشل إنشاء الحساب");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          <span className="text-sm">العودة</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm slide-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">نبض</h1>
            <p className="text-muted-foreground">
              {isLogin ? "مرحباً بعودتك" : "انضم إلى المجتمع"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName">الاسم</Label>
                  <Input
                    id="displayName"
                    placeholder="اسمك الكامل"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-secondary border-0"
                    required
                    disabled={isLoading}
                  />
                  {errors.displayName && (
                    <p className="text-sm text-destructive">
                      {errors.displayName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input
                    id="username"
                    placeholder="username"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className="bg-secondary border-0"
                    dir="ltr"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    أحرف إنجليزية وأرقام و _ فقط، يبدأ بحرف
                  </p>
                  {errors.username && (
                    <p className="text-sm text-destructive">
                      {errors.username}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary border-0"
                    dir="ltr"
                    required
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </>
            )}

            {isLogin && (
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">البريد أو اسم المستخدم</Label>
                <Input
                  id="emailOrUsername"
                  placeholder="your@email.com أو username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="bg-secondary border-0"
                  dir="ltr"
                  required
                  disabled={isLoading}
                />
                {errors.emailOrUsername && (
                  <p className="text-sm text-destructive">
                    {errors.emailOrUsername}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-0"
                required
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isLogin ? (
                "تسجيل الدخول"
              ) : (
                "إنشاء حساب"
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
            </span>{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="font-medium hover:underline"
              disabled={isLoading}
            >
              {isLogin ? "إنشاء حساب" : "تسجيل الدخول"}
            </button>
          </div>

          {/* Developer credit - Always visible */}
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg">
            <p className="text-center text-sm">
              <span className="text-muted-foreground">تم التطوير بواسطة</span>
              <br />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                عبد الرحمن عامر قاطن
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
