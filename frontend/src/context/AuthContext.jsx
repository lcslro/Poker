import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin } from "../api/index";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: parseInt(payload.sub) };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(() => {
    const t = localStorage.getItem("token");
    return t ? decodeToken(t) : null;
  });

  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    setCurrentUser(decodeToken(data.access_token));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
