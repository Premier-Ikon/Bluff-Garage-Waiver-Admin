"use client";

import {
  User,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Profile, requestAdminCode, verifyAdminCode, postApi } from "./api";
import { firebaseReady, getFirebaseAuth } from "./firebase";

type AuthState = {
  loading: boolean;
  ready: boolean;
  user: User | null;
  profile: Profile | null;
  gateError: string;
  requestCode: (email: string) => Promise<string>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logOut: () => Promise<void>;
  clearGateError: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const ready = firebaseReady();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gateError, setGateError] = useState("");

  useEffect(() => {
    if (!ready) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, async (current) => {
      if (!current) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const token = await current.getIdToken();
        const next = await postApi<Profile>({ action: "me" }, token);
        setUser(current);
        setProfile(next);
        setGateError("");
      } catch (error) {
        await signOut(auth);
        setUser(null);
        setProfile(null);
        setGateError(
          error instanceof Error
            ? error.message
            : "This account is not on the admin list.",
        );
      } finally {
        setLoading(false);
      }
    });
  }, [ready]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      ready,
      user,
      profile,
      gateError,
      clearGateError() {
        setGateError("");
      },
      async requestCode(email) {
        setGateError("");
        const payload = await requestAdminCode(email);
        return (
          payload.message ||
          "If that email is on the team list, a sign-in code is on the way."
        );
      },
      async verifyCode(email, code) {
        setGateError("");
        const payload = await verifyAdminCode(email, code);
        await signInWithCustomToken(getFirebaseAuth(), payload.token);
      },
      async logOut() {
        await signOut(getFirebaseAuth());
      },
    }),
    [loading, ready, user, profile, gateError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
