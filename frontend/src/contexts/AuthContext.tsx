import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "@/lib/api";

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (
    emailOrUsername: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface SignupData {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      const token = localStorage.getItem("pulsar_token");
      const storedUser = localStorage.getItem("pulsar_user");

      if (token && storedUser) {
        try {
          // Verify token is still valid
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          // Token expired or invalid
          localStorage.removeItem("pulsar_token");
          localStorage.removeItem("pulsar_user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (
    emailOrUsername: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authAPI.login(emailOrUsername, password);
      const { token, user: userData } = response.data;

      // Save token and user
      localStorage.setItem("pulsar_token", token);
      localStorage.setItem("pulsar_user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "حدث خطأ أثناء تسجيل الدخول";
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (
    data: SignupData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authAPI.register(data);
      const { token, user: userData } = response.data;

      // Save token and user
      localStorage.setItem("pulsar_token", token);
      localStorage.setItem("pulsar_user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "حدث خطأ أثناء التسجيل";
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pulsar_token");
    localStorage.removeItem("pulsar_user");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        جاري التحميل...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
