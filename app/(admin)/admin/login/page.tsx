"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button, Card, Spinner } from "@heroui/react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden>
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  // NextAuth redirects back with ?error=AccessDenied when the email is not allowed
  const errorParam = searchParams.get("error");
  const errorMessage =
    errorParam === "AccessDenied"
      ? "Access denied. Your Google account is not authorised."
      : errorParam
        ? "Sign-in failed. Please try again."
        : "";

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/admin" });
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-foreground text-background">
            <span className="text-lg font-black">I</span>
          </div>
          <div className="leading-tight">
            <div className="text-xl font-bold tracking-wide text-foreground">INCIAL</div>
            <div className="text-[11px] uppercase tracking-widest text-muted">Admin portal</div>
          </div>
        </div>

        <Card className="gap-5 p-8">
          <Card.Header>
            <Card.Title className="text-lg">Sign in</Card.Title>
            <Card.Description>Access is restricted to authorised accounts only.</Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            {errorMessage && (
              <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-center text-sm text-danger">
                {errorMessage}
              </div>
            )}
            <Button size="lg" variant="secondary" className="w-full" isDisabled={loading} onPress={handleGoogleSignIn}>
              {loading ? (
                <>
                  <Spinner size="sm" color="current" />
                  Redirecting to Google…
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </Button>
          </Card.Content>
        </Card>

        <p className="mt-6 text-center text-xs text-muted">Incial · Internal dashboard</p>
      </div>
    </div>
  );
}

// useSearchParams needs a Suspense boundary in the app router
export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
