"use client";

import React from "react";

export default function MascotClient({
  src = "/images/tomo2.png",
  alt = "Tomo mascot",
}: {
  src?: string;
  alt?: string;
}) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible">
      <style>{`
        @keyframes tomo-float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes bubble-sway {
          0% { transform: translateY(0) rotate(6deg); }
          50% { transform: translateY(-6px) rotate(6deg); }
          100% { transform: translateY(0) rotate(6deg); }
        }
      `}</style>

      <picture className="block w-full h-full pointer-events-none">
        <source srcSet={src} type="image/png" />
        <img
          src={src}
          alt={alt}
          className="mx-auto h-full w-full object-contain"
          style={{
            animation: "tomo-float 4s ease-in-out infinite",
            willChange: "transform",
            filter: "drop-shadow(0 30px 40px rgba(141,74,10,0.12))",
          }}
        />
      </picture>

      <div
        className="absolute left-[34%] top-[6%] w-[18rem] sm:w-[20rem] rounded-[22px] bg-white px-6 py-5 text-left z-30"
        style={{ animation: "bubble-sway 4s ease-in-out infinite" }}
      >
        <p className="max-w-[18rem] text-[1.06rem] sm:text-[1.12rem] font-black leading-[1.03] text-[#2e261f]">
          Hai, I'm Tomo! Let's start our financial adventure together.
        </p>
        <div className="absolute bottom-[-11px] left-[18%] h-5 w-5 rotate-45 bg-white shadow-[-4px_4px_10px_rgba(135,90,35,0.08)]" />
      </div>
    </div>
  );
}
