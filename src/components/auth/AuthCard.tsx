"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function AuthCard({ mode }: { mode: "sign-in" | "sign-up" | "forgot" }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const title = mode === "sign-in" ? "Welcome back" : mode === "sign-up" ? "Create your renter account" : "Reset your password";
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget); const email = String(form.get("email")); const password = String(form.get("password") ?? "");
    const client = createBrowserSupabaseClient();
    if (!client) { setMessage("Demo mode accepted the request. Configure Supabase Auth to create a secure session and send email."); setBusy(false); return; }
    const result = mode === "sign-in" ? await client.auth.signInWithPassword({ email, password }) : mode === "sign-up" ? await client.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } }) : await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback` });
    if (result.error) setMessage(result.error.message); else if (mode === "sign-in") window.location.assign("/account"); else setMessage("Check your email for the secure confirmation link.");
    setBusy(false);
  };
  const passwordless = async () => { const emailInput = document.querySelector<HTMLInputElement>("#auth-email"); if (!emailInput?.value) { setMessage("Enter your email first."); return; } const client = createBrowserSupabaseClient(); if (!client) { setMessage("Demo passwordless request accepted. Configure Supabase to send the link."); return; } setBusy(true); const { error } = await client.auth.signInWithOtp({ email: emailInput.value, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } }); setMessage(error?.message ?? "Check your email for the secure sign-in link."); setBusy(false); };
  return <main className="auth-wrap"><section className="auth-card"><p className="kicker">Secure account access</p><h1>{title}</h1><p>{mode === "forgot" ? "We’ll send a password-reset link if an account exists." : "Use email and password, or request a passwordless link. Mock mode does not create a real identity."}</p><form className="stack-form" onSubmit={submit}><label>Email address<input id="auth-email" name="email" type="email" autoComplete="email" required /></label>{mode !== "forgot" && <label>Password<input name="password" type="password" minLength={8} autoComplete={mode === "sign-up" ? "new-password" : "current-password"} required /></label>}<button className="button button-coral" disabled={busy} type="submit">{busy ? "Working…" : mode === "forgot" ? "Send reset link" : mode === "sign-up" ? "Create account" : "Sign in"}</button>{mode !== "forgot" && <button className="button button-outline" disabled={busy} type="button" onClick={passwordless}>Email me a passwordless link</button>}{message && <p className="form-message" role="status">{message}</p>}</form><div className="auth-links">{mode === "sign-in" ? <><Link href="/sign-up">Create account</Link><Link href="/forgot-password">Forgot password?</Link></> : <Link href="/sign-in">Back to sign in</Link>}</div></section></main>;
}
