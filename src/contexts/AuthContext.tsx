"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  localSignOut,
  readLocalSession,
  type LocalAuthUser,
} from "@/lib/auth/local";
import { createClient } from "@/lib/supabase/client";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export type AppUser = {
  id: string;
  email: string;
};

interface AuthContextValue {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  mode: "supabase" | "local";
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAppUser(local: LocalAuthUser | null): AppUser | null {
  if (!local) return null;
  return { id: local.id, email: local.email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabaseConfigured = getSupabasePublicEnv().isConfigured;

  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"supabase" | "local">(
    supabaseConfigured ? "supabase" : "local",
  );

  const applyLocal = useCallback(() => {
    setSession(null);
    setUser(toAppUser(readLocalSession()));
    setMode("local");
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    if (supabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data.session?.user) {
            setSession(data.session);
            setUser({
              id: data.session.user.id,
              email: data.session.user.email ?? "",
            });
            setMode("supabase");
            setLoading(false);
            return;
          }
        } catch {
          // 네트워크/DNS 실패 시 로컬 세션으로 폴백
        }
      }
    }

    applyLocal();
  }, [applyLocal, supabaseConfigured]);

  useEffect(() => {
    void refresh();

    const onLocal = () => applyLocal();
    window.addEventListener("viago:local-auth", onLocal as EventListener);
    window.addEventListener("storage", onLocal);

    if (!supabaseConfigured) {
      return () => {
        window.removeEventListener("viago:local-auth", onLocal as EventListener);
        window.removeEventListener("storage", onLocal);
      };
    }

    const supabase = createClient();
    if (!supabase) {
      return () => {
        window.removeEventListener("viago:local-auth", onLocal as EventListener);
        window.removeEventListener("storage", onLocal);
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession?.user) {
        setSession(nextSession);
        setUser({
          id: nextSession.user.id,
          email: nextSession.user.email ?? "",
        });
        setMode("supabase");
        setLoading(false);
        return;
      }
      // Supabase 세션이 없으면 로컬 유지/적용
      applyLocal();
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("viago:local-auth", onLocal as EventListener);
      window.removeEventListener("storage", onLocal);
    };
  }, [applyLocal, refresh, supabaseConfigured]);

  const signOut = useCallback(async () => {
    localSignOut();
    if (supabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
      }
    }
    setUser(null);
    setSession(null);
    setMode(supabaseConfigured ? "supabase" : "local");
  }, [supabaseConfigured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      configured: true,
      mode,
      refresh,
      signOut,
    }),
    [user, session, loading, mode, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
