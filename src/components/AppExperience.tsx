"use client";

import { useEffect, useRef, useState } from "react";
import { getSoundSettings, startMusic, unlockAudio } from "@/lib/audio/sound";

export default function AppExperience() {
  const [phase, setPhase] = useState<"loading" | "fading" | "done">("loading");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const onGesture = () => {
      unlockAudio();
      if (getSoundSettings().music) startMusic();
    };
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });

    const t1 = setTimeout(() => setPhase("fading"), 2400);
    const t2 = setTimeout(() => setPhase("done"), 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050b14] transition-opacity duration-700 ${
        phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden
    >
      {/* Aurora */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-a absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(22,199,195,0.13),transparent)] blur-3xl" />
        <div className="aurora-b absolute left-1/2 top-[48%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(18,118,227,0.11),transparent)] blur-3xl" />
      </div>

      {/* Emblem + wordmark */}
      <div
        className="relative flex flex-col items-center gap-6"
        style={{ animation: "splashPop 0.9s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {/* Circle emblem */}
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(22,199,195,0.12) 0%, rgba(18,118,227,0.12) 100%)",
            boxShadow:
              "0 0 0 1px rgba(22,199,195,0.3), 0 0 56px rgba(22,199,195,0.15)",
            animation: "splashGlow 2.6s ease-in-out infinite alternate",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-space, sans-serif)",
              fontSize: "2rem",
              fontWeight: 800,
              lineHeight: 1,
              background: "linear-gradient(135deg, #16c7c3 0%, #1276e3 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            S
          </span>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <div
            style={{
              fontFamily: "var(--font-space, sans-serif)",
              fontSize: "2.75rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            San
            <span
              style={{
                background: "linear-gradient(90deg, #16c7c3, #1276e3)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Up
            </span>
          </div>
          <p
            style={{
              fontSize: "0.6rem",
              textTransform: "uppercase",
              letterSpacing: "0.5em",
              color: "rgba(143,176,199,0.45)",
            }}
          >
            L&apos;ascesa
          </p>
        </div>
      </div>

      {/* Bottom progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden bg-white/[0.04]">
        <div
          className="h-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #16c7c3 45%, #1276e3 75%, transparent 100%)",
            animation: "splashProgress 2.4s ease-out forwards",
          }}
        />
      </div>
    </div>
  );
}
