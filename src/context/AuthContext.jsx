import { createContext, useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, subscribeAuthChanges } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => isAuthenticated());

  useEffect(() => {
    const unsubscribe = subscribeAuthChanges(() => {
      setAuthed(isAuthenticated());
    });

    return unsubscribe;
  }, []);

  const value = { authed };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export function ProtectedRoute({ children, redirectTo = "/" }) {
  const { authed } = useAuth();

  if (!authed) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
