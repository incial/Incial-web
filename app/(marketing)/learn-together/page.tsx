"use client";

import { useDevice } from "@/hooks";
import { MobileLearnTogetherPage } from "@/components/mobile/MobileLearnTogetherPage";
import { LearnTogetherPage as DesktopLearnTogetherPage } from "@/components/features/learn-together";

export default function LearnTogetherPage() {
  const { isMobile, isLoading } = useDevice();

  if (isLoading) {
    return <div className="min-h-screen w-full bg-black" />;
  }

  return isMobile ? <MobileLearnTogetherPage /> : <DesktopLearnTogetherPage />;
}
