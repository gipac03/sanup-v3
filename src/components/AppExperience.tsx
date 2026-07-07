"use client";

import { useEffect, useRef, useState } from "react";
import { getSoundSettings, startMusic, unlockAudio } from "@/lib/audio/sound";

/**
 * Esperienza d'ingresso dell'app: splash animato + sblocco audio.
 *
 * Lo splash parte al montaggio del gruppo (app) (cioe' all'ingresso nell'app)
 * e si dissolve dopo ~2.2s. Al primo gesto dell'utente si sblocca il contesto
 * audio e, se abilitata nelle impostazioni, parte la musica soft.
 */
export default function AppExperience() {
  const [phase, setPhase] = useState<"loading" | "fading" | "done">("loading");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // guardia contro il doppio-invoke di Strict Mode
    started.current = true;

    const onGesture = () => {
      unlockAudio();
      if (getSoundSettings().music) startMusic();
    };
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });

    const t1 = setTimeout(() => setPhase("fading"), 2200);
    const t2 = setTimeout(() => setPhase("done"), 2950);
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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-a absolute left-1/2 top-1/3 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(22,199,195,0.28),transparent)] blur-3xl" />
        <div className="aurora-b absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(18,118,227,0.22),transparent)] blur-3xl" />
      </div>

      {/* anello rotante */}
      <div
        className="relative mb-8 h-24 w-24"
        style={{ animation: "splashPop 0.7s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(22,199,195,0.15) 90deg, #16c7c3 220deg, #1276e3 320deg, transparent 360deg)",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            animation: "spinSlow 1.1s linear infinite",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_20px_rgba(22,199,195,0.9)]" />
        </div>
      </div>

      <div
        className="font-[family-name:var(--font-space)] text-4xl font-bold tracking-wide"
        style={{ animation: "splashPop 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}
      >
        San<span className="text-primary">Up</span>
      </div>
      <div
        className="mt-2 font-[family-name:var(--font-space)] text-[0.65rem] uppercase tracking-[0.45em] text-muted"
        style={{ animation: "splashPop 0.7s cubic-bezier(0.22,1,0.36,1) 0.18s both" }}
      >
        L&apos;ascesa
      </div>

      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-[#1276e3] shadow-[0_0_14px_rgba(22,199,195,0.7)]"
          style={{ animation: "splashProgress 2.2s ease-out forwards" }}
        />
      </div>
    </div>
  );
}
