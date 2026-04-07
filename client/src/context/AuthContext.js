import { createContext, useContext, useState, useEffect } from "react";
import * as authAPI from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored) setUser(stored);
  }, []);

  const login = async (formData) => {
    try {
      const { data } = await authAPI.login(formData);

      // IMPORTANT: adapt this to your backend response
      const userData = {
        ...data.user,
        token: data.token || null, // if you add JWT later
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);