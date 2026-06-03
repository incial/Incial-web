"use client";

interface FooterProps {
  noPadding?: boolean;
}

export default function Footer({ noPadding = false }: FooterProps) {
  return (
    <footer className="w-full py-4 text-white opacity-70">
      <div className={noPadding ? "w-full" : "container mx-auto px-6 md:px-12 w-full"}>
        {/* Mobile layout */}
        <div className="flex flex-col items-center justify-center gap-2 md:hidden">
          <div className="text-base font-bold tracking-tight text-center">incial</div>
          <div className="flex flex-col items-center text-center">
            <span className="font-light italic text-gray-400 text-[10px] leading-tight">Location:</span>
            <span className="text-[11px] leading-tight">Kanjirappally, Kerala, India</span>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:grid grid-cols-3 items-center text-base w-full">
          <div className="flex flex-col text-left">
            <span className="font-light italic text-gray-400">Location:</span>
            <span>Kanjirappally, Kerala, India</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-center">incial</div>
          <div className="w-full"></div>
        </div>
      </div>
    </footer>
  );
}