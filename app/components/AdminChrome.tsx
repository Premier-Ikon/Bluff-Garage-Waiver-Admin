"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/AuthProvider";

export function AdminChrome({ children }: { children: ReactNode }) {
  const {
    loading,
    ready,
    user,
    profile,
    requestCode,
    verifyCode,
    logOut,
    gateError,
    clearGateError,
  } = useAuth();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onRequestCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    clearGateError();
    try {
      const message = await requestCode(email);
      setNotice(message);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send a code.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    clearGateError();
    try {
      await verifyCode(email, code);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not verify that code.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="login">
        <div
          className="login-card"
          style={{ justifyItems: "center", textAlign: "center" }}
        >
          <img className="brand-mark" src="/logo.png" alt="Bluff" />
          <p className="muted">Loading…</p>
        </div>
      </main>
    );
  }

  if (!ready || !user || !profile) {
    return (
      <main className="login">
        <form
          className="login-card"
          onSubmit={step === "email" ? onRequestCode : onVerifyCode}
        >
          <img className="brand-mark" src="/logo.png" alt="Bluff" />
          <div className="login-copy">
            <p className="eyebrow">Bluff</p>
            <h1>Waiver desk</h1>
            <p className="muted">
              {step === "email"
                ? "Enter your approved Premier Ikon email. We’ll send a one-time code if you’re on the list."
                : `Enter the 6-digit code sent to ${email}.`}
            </p>
          </div>
          {step === "email" ? (
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </label>
          ) : (
            <label>
              Code
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                autoComplete="one-time-code"
                placeholder="123456"
              />
            </label>
          )}
          {notice ? <p className="ok">{notice}</p> : null}
          {error || gateError ? (
            <p className="error">{error || gateError}</p>
          ) : null}
          {!ready ? (
            <p className="error">Firebase is not configured for this app yet.</p>
          ) : null}
          <button className="primary" type="submit" disabled={busy || !ready}>
            {busy
              ? "Please wait…"
              : step === "email"
                ? "Send code"
                : "Sign in"}
          </button>
          {step === "code" ? (
            <button
              className="ghost forgot-button"
              type="button"
              disabled={busy}
              onClick={() => {
                setStep("email");
                setCode("");
                setNotice("");
                setError("");
              }}
            >
              Use a different email
            </button>
          ) : null}
        </form>
      </main>
    );
  }

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="brand">
            <img src="/logo.png" alt="Bluff" />
            <span>Waiver admin</span>
          </Link>
          <nav className="nav">
            <Link className={pathname === "/" ? "is-on" : ""} href="/">
              Signatures
            </Link>
            <Link
              className={pathname.startsWith("/team") ? "is-on" : ""}
              href="/team"
            >
              Team
            </Link>
          </nav>
          <div className="account">
            <span>{profile.email}</span>
            <button type="button" className="ghost" onClick={() => void logOut()}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
