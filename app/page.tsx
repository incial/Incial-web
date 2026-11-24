"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { greetings } from "@/lib/constants";
import GreetingsOverlay from "@/components/sections/GreetingsOverlay";
import { useDevice } from "@/hooks";

// Each layout is loaded only on the device that uses it.
// While a layout loads the screen stays black, never the page's white background.
const BlackScreen = () => <div className="fixed inset-0 bg-black" />;

const DesktopHome = dynamic(() => import("@/components/features/home/DesktopHome"), {
  loading: BlackScreen,
});
const MobileServicePage = dynamic(
  () => import("@/components/mobile").then((mod) => mod.MobileServicePage),
  { loading: BlackScreen },
);

const GREETING_STEP_MS = 500;
const SESSION_KEY = "initial-load-done";

export default function Home() {
  const { isMobile, isLoading: isDeviceLoading } = useDevice();
  const [isReady, setIsReady] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);

  /* ── Greeting preloader: once per session, then the page itself ── */
  useEffect(() => {
    if (isReady) return;

    if (sessionStorage.getItem(SESSION_KEY)) {
      setIsReady(true);
      return;
    }

    const isLastGreeting = greetingIndex >= greetings.length - 1;
    const timer = setTimeout(() => {
      if (isLastGreeting) {
        sessionStorage.setItem(SESSION_KEY, "true");
        setIsReady(true);
      } else {
        setGreetingIndex((index) => index + 1);
      }
    }, GREETING_STEP_MS);

    return () => clearTimeout(timer);
  }, [greetingIndex, isReady]);

  if (isDeviceLoading) {
    return isReady ? (
      <div className="fixed inset-0 bg-black" />
    ) : (
      <GreetingsOverlay greetingIndex={greetingIndex} />
    );
  }

  // Desktop mounts behind the greetings (their overlay is drawn last, so it covers the page) and
  // its intro starts when they end: the page's heavy parts load while only plain text animates.
  // The phone layout starts its own intro when it mounts, so it waits for the greetings.
  return (
    <>
      {isMobile ? (
        isReady && (
          <div className="fixed inset-0 bg-black">
            <MobileServicePage skipPreloader activeHash={window.location.hash.replace("#", "")} />
          </div>
        )
      ) : (
        <DesktopHome isActive={isReady} />
      )}
      {!isReady && <GreetingsOverlay greetingIndex={greetingIndex} />}
    </>
  );
}
