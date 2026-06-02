import { createContext, useContext, useState } from "react";
import { login as loginRequest, logout as logoutRequest, getToken } from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(Boolean(getToken()));

  async function login(email, password) {
    await loginRequest(email, password);
    setIsAuth(true);
  }

  function logout() {
    logoutRequest();
    setIsAuth(false);
  }

  return (
    <AuthContext.Provider value={{ login, logout, isAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}