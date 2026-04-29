"use client";

export default function Footer() {
  return (
    <footer className="w-full py-4 text-white opacity-70">
      {/* Mobile layout */}
      <div className="flex flex-row items-center justify-between md:hidden">
        <div className="flex flex-col">
          <span className="font-light italic text-gray-400 text-[10px] leading-tight">Location:</span>
          <span className="text-[11px] leading-tight">Kanjirappally, Kerala, India</span>
        </div>
        <div className="text-base font-bold tracking-tight">incial</div>
      </div>

      {/* Desktop layout (untouched) */}
      <div className="hidden md:flex flex-row justify-between items-center text-base">
        <div className="flex flex-col text-left">
          <span className="font-light italic text-gray-400">Location:</span>
          <span>Kanjirappally, Kerala, India</span>
        </div>
        <div className="text-2xl font-bold tracking-tight">incial</div>
        <div className="w-[150px]"></div>
      </div>
    </footer>
  );
}