"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { greetings } from "@/lib/constants";
import GreetingsOverlay from "@/components/sections/GreetingsOverlay";

// While the page loads, the screen stays black (the greetings and the intro open on black).
const BlackScreen = () => <div className="fixed inset-0 bg-black" />;
// browser only: its intro reads the screen size as it mounts
const HomePage = dynamic(() => import("@/components/features/home/HomePage"), { loading: BlackScreen, ssr: false });

const GREETING_STEP_MS = 500;
const SESSION_KEY = "initial-load-done";

const noopSubscribe = () => () => {};
const getSessionSnapshot = () => Boolean(sessionStorage.getItem(SESSION_KEY));
const getServerSnapshot = () => false;

export default function Home() {
  const sessionDone = useSyncExternalStore(noopSubscribe, getSessionSnapshot, getServerSnapshot);
  const [completed, setCompleted] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const isReady = sessionDone || completed;

  /* ── Greeting preloader ("Hello" in many languages, on black): once per session ── */
  useEffect(() => {
    if (isReady) return;

    const isLastGreeting = greetingIndex >= greetings.length - 1;
    const timer = setTimeout(() => {
      if (isLastGreeting) {
        sessionStorage.setItem(SESSION_KEY, "true");
        setCompleted(true);
      } else {
        setGreetingIndex((index) => index + 1);
      }
    }, GREETING_STEP_MS);

    return () => clearTimeout(timer);
  }, [greetingIndex, isReady]);

  // The page mounts behind the greetings (their overlay is drawn last, so it covers it); the intro
  // starts when they end.
  return (
    <>
      <HomePage active={isReady} />
      {!isReady && <GreetingsOverlay greetingIndex={greetingIndex} />}
    </>
  );
}
