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
        queryClient.removeQueries({ predicate: (query) => query.meta?.authRequired === true });
        await saveSessionToken(data.token);
        setToken(data.token);
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
