import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

const TOKEN_KEY = 'student_nexus_token';
const USER_KEY = 'student_nexus_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    if (!localStorage.getItem(TOKEN_KEY)) return null;
    const res = await authApi.me();
    const nextUser = res?.data?.user || null;
    setUser(nextUser);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    return nextUser;
  }

  function setSession(nextToken, nextUser) {
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setToken('');
    }

    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    } else {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }

  async function signup(payload) {
    const res = await authApi.register(payload);
    const nextToken = res?.data?.token || '';
    const nextUser = res?.data?.user || null;
    setSession(nextToken, nextUser);
    return nextUser;
  }

  async function signin({ email, password }) {
    const res = await authApi.login({ email, password });
    const nextToken = res?.data?.token || '';
    const nextUser = res?.data?.user || null;
    setSession(nextToken, nextUser);
    return nextUser;
  }

  async function signout() {
    try {
      await authApi.logout();
    } finally {
      setSession('', null);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (localStorage.getItem(TOKEN_KEY)) {
          await refreshMe();
        }
      } catch {
        setSession('', null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, signup, signin, signout, refreshMe }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

