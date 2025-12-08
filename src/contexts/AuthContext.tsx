import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import apiClient from "../services/api";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export type UserRole = "user" | "staff" | "admin";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userId: number | null;
  login: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserInfo = async () => {
    try {
      const response = await apiClient.get("/api/users/me");
      console.log("Fetched user info:", response.data);
      setUserRole(response.data.role);
      setUserId(response.data.id);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user info", error);
      setIsAuthenticated(false);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    await fetchUserInfo();
  };

  const logout = () => {
    auth.signOut();
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo();
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userRole, userId, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
