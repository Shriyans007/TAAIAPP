import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { requestJson } from '@/services/http';
import { urls } from '@/services/config';
import type { UserProfile } from '@/types/user';
import { clearSessionToken, getSessionToken, saveSessionToken } from './sessionStorage';
type AuthValue = {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  login(identifier: string, password: string): Promise<void>;
  registerAccount(details: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void>;
  loginWithGoogle(idToken: string, mode: 'login' | 'register'): Promise<void>;
  linkGoogle(idToken: string): Promise<void>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
};
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const loadMe = async (t: string) => {
    const me = await requestJson<UserProfile>(`${urls.mobile}/me`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    setUser(me);
  };
  const acceptSession = async (data: { token: string; user: UserProfile }) => {
    queryClient.removeQueries({ predicate: (query) => query.meta?.authRequired === true });
    await saveSessionToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };
  useEffect(() => {
    getSessionToken()
      .then(async (t) => {
        if (t) {
          try {
            await loadMe(t);
            setToken(t);
          } catch {
            await clearSessionToken();
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);
  const value = useMemo<AuthValue>(
    () => ({
      token,
      user,
      loading,
      login: async (identifier, password) => {
        const data = await requestJson<{ token: string; user: UserProfile }>(
          `${urls.mobile}/login`,
          { method: 'POST', body: JSON.stringify({ identifier, password }) },
        );
        await acceptSession(data);
      },
      registerAccount: async (details) => {
        const data = await requestJson<{ token: string; user: UserProfile }>(
          `${urls.mobile}/register`,
          { method: 'POST', body: JSON.stringify(details) },
        );
        await acceptSession(data);
      },
      loginWithGoogle: async (idToken, mode) => {
        const data = await requestJson<{ token: string; user: UserProfile }>(
          `${urls.mobile}/google/${mode}`,
          { method: 'POST', body: JSON.stringify({ idToken }) },
        );
        await acceptSession(data);
      },
      linkGoogle: async (idToken) => {
        if (!token) throw new Error('Log in with your TAAI password before linking Google.');
        const data = await requestJson<{ user: UserProfile }>(`${urls.mobile}/google/link`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ idToken }),
        });
        setUser(data.user);
      },
      logout: async () => {
        if (token) {
          try {
            await requestJson(`${urls.mobile}/push-token`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch {}
          try {
            await requestJson(`${urls.mobile}/logout`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch {}
        }
        await clearSessionToken();
        setToken(null);
        setUser(null);
        queryClient.removeQueries({ predicate: (query) => query.meta?.authRequired === true });
      },
      refresh: async () => {
        if (token) await loadMe(token);
      },
    }),
    [token, user, loading, queryClient],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
