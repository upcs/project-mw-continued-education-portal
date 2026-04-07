import { createContext, useContext, useEffect, useMemo, useState } from "react";
import API from "../api/api";
import { hasPermission as checkPermission } from "../utils/roles";

const AuthContext = createContext();

function getStoredUser() {
  try {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const savedUser = getStoredUser();

      if (!savedUser) {
        setAuthLoading(false);
        return;
      }

      if (!savedUser?.token) {
        localStorage.removeItem("user");
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const { data } = await API.get("/auth/me");

        const serverUser = data?.user || data;

        const nextUser = {
          ...serverUser,
          token: savedUser.token,
        };

        setUser(nextUser);
        localStorage.setItem("user", JSON.stringify(nextUser));

        if (nextUser?.email) localStorage.setItem("email", nextUser.email);
        if (nextUser?.fullname) localStorage.setItem("name", nextUser.fullname);
        if (nextUser?.photo) localStorage.setItem("photo", nextUser.photo);
        localStorage.setItem("isAuthenticated", "true");
      } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        localStorage.removeItem("photo");
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (formData) => {
    const { data } = await API.post("/auth/login", formData);

    const nextUser = {
      ...(data?.user || {}),
      token: data?.token,
    };

    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));

    if (nextUser?.email) localStorage.setItem("email", nextUser.email);
    if (nextUser?.fullname) localStorage.setItem("name", nextUser.fullname);
    if (nextUser?.photo) localStorage.setItem("photo", nextUser.photo);
    localStorage.setItem("isAuthenticated", "true");

    return nextUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("photo");
  };

  const hasRole = (roleOrRoles) => {
    if (!user?.role) return false;

    if (Array.isArray(roleOrRoles)) {
      return roleOrRoles.includes(user.role);
    }

    return user.role === roleOrRoles;
  };

  const hasPermission = (permission) => {
    if (!user?.role) return false;
    return checkPermission(user.role, permission);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      authLoading,
      login,
      logout,
      hasRole,
      hasPermission,
      isAuthenticated: !!user,
    }),
    [user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}