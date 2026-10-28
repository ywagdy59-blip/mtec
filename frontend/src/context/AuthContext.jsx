import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { getToken, setToken } from "../services/api";
import * as authService from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  // restore the session after a page refresh
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    authService
      .getMe()
      .then((data) => !cancelled && setUser(data.user))
      .catch(() => !cancelled && setToken(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  // tells the server to invalidate the token, then clears it locally (even if the call fails)
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* the token is removed below either way */
    }
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
