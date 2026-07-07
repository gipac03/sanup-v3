"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { computeOverview, type OverviewStats } from "@/lib/stats";
import { SUBJECTS, SUBJECT_BY_ID } from "@/lib/domain/taxonomy";
import { questionRepository } from "@/lib/data/repository";
import { ButtonLink } from "@/components/ui";

const SUBJECT_ICON: Record<string, string> = {
  biology: "🔬",
  chemistry: "⚗️",
  physics: "⚛️",
  math: "📐",
  logic: "🧩",
  reading: "📖",
};

/** Animazione count-up: da 0 al valore, con ease-out. Rispetta reduce-motion. */
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 950;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <>
      {n}
      {suffix}
    </>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setStats(computeOverview());
    void (async () => {
      const all = await questionRepository.getAll();
      const c: Record<string, number> = {};
      for (const q of all) c[q.subject] = (c[q.subject] ?? 0) + 1;
      setCounts(c);
    })();
  }, []);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const hasData = stats !== null && stats.totalSessions > 0;
  const accuracyPct =
    stats && stats.overallAccuracy !== null
      ? Math.round(stats.overallAccuracy * 100)
      : null;
  const weakest =
    stats && stats.weakestSubject
      ? SUBJECT_BY_ID[stats.weakestSubject].shortLabel
      : null;

  return (
    <div className="-mt-6">
      {/* ===== HERO cinematico ===== */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/15 px-6 pt-14 pb-10 sm:px-8">
        {/* aurora animata dietro l'hero */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="aurora-a absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(22,199,195,0.35),transparent)] blur-2xl" />
          <div className="aurora-b absolute -top-10 right-0 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(18,118,227,0.32),transparent)] blur-2xl" />
          <div className="aurora-a absolute bottom-[-40%] left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(22,199,195,0.18),transparent)] blur-2xl" />
        </div>

        <p className="reveal font-[family-name:var(--font-space)] text-xs font-medium uppercase tracking-[0.35em] text-primary">
          La tua ascesa
        </p>
        <h1
          className="reveal mt-3 text-4xl font-bold leading-[1.05] sm:text-5xl"
          style={{ animationDelay: "0.08s" }}
        >
          Bentornato.
          <br />
          <span className="bg-gradient-to-r from-primary to-[#5bb8f5] bg-clip-text text-transparent">
            Continua a salire.
          </span>
        </h1>
        <p
          className="reveal mt-4 max-w-md text-base leading-relaxed text-muted"
          style={{ animationDelay: "0.16s" }}
        >
          {hasData
            ? "Riprendi da dove hai lasciato e punta sulle materie che ti fanno perdere più punti."
            : "Un gradino alla volta fino al test. Inizia il tuo primo quiz: bastano 5 domande."}
        </p>

        <div
          className="reveal mt-7 flex flex-wrap gap-3"
          style={{ animationDelay: "0.24s" }}
        >
          <ButtonLink href="/allenati">Allenati ora →</ButtonLink>
          <ButtonLink href="/errori" variant="secondary">
            Ripassa errori
          </ButtonLink>
        </div>

        {total > 0 ? (
          <p
            className="reveal mt-6 font-[family-name:var(--font-space)] text-sm text-muted"
            style={{ animationDelay: "0.3s" }}
          >
            <span className="text-primary">
              <CountUp value={total} />
            </span>{" "}
            domande · 6 materie · nessun abbonamento
          </p>
        ) : null}
      </section>

      {/* ===== STAT TILES ===== */}
      <section
        className="reveal mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        style={{ animationDelay: "0.36s" }}
      >
        <StatTile
          label="Accuratezza"
          display={
            accuracyPct !== null ? <CountUp value={accuracyPct} suffix="%" /> : "—"
          }
        />
        <StatTile
          label="Errori aperti"
          display={stats ? <CountUp value={stats.openErrors} /> : "—"}
        />
        <StatTile
          label="Sessioni"
          display={stats ? <CountUp value={stats.totalSessions} /> : "—"}
        />
        <StatTile label="Da rinforzare" display={weakest ?? "—"} small />
      </section>

      {/* ===== MATERIE ===== */}
      <section className="reveal mt-8" style={{ animationDelay: "0.44s" }}>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Le tue materie</h2>
          <Link
            href="/allenati/materia"
            className="text-sm font-medium text-primary"
          >
            Allenati →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SUBJECTS.map((s) => (
            <Link
              key={s.id}
              href="/allenati/materia"
              className="group glass rounded-2xl border border-border p-4 transition-all hover:border-primary/40 hover:shadow-[0_0_30px_rgba(22,199,195,0.12)]"
            >
              <div className="text-2xl leading-none">{SUBJECT_ICON[s.id]}</div>
              <div className="mt-3 font-[family-name:var(--font-space)] text-sm font-semibold uppercase tracking-wide text-muted">
                {s.shortLabel}
              </div>
              <div className="mt-1 font-[family-name:var(--font-space)] text-2xl font-bold text-primary">
                {counts[s.id] !== undefined ? (
                  <CountUp value={counts[s.id]} />
                ) : (
                  "—"
                )}
                <span className="ml-1 text-[0.6rem] font-medium uppercase tracking-widest text-muted">
                  domande
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== VERSO L'OBIETTIVO ===== */}
      {total > 0 ? (
        <section className="reveal mt-8" style={{ animationDelay: "0.52s" }}>
          <div className="glass rounded-2xl border border-border p-5">
            <div className="flex items-baseline justify-between">
              <p className="font-[family-name:var(--font-space)] text-sm font-semibold">
                La banca cresce
              </p>
              <p className="font-[family-name:var(--font-space)] text-sm text-muted">
                <span className="text-primary">{total.toLocaleString("it-IT")}</span>{" "}
                / 5.000
              </p>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-[#1276e3] shadow-[0_0_16px_rgba(22,199,195,0.5)] transition-[width] duration-1000 ease-out"
                style={{ width: `${Math.min(100, (total / 5000) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              Obiettivo: 5.000 domande originali, ognuna con spiegazione.
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function StatTile({
  label,
  display,
  small = false,
}: {
  label: string;
  display: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div className="glass rounded-2xl border border-border p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-1 font-[family-name:var(--font-space)] font-bold text-primary ${
          small ? "text-lg" : "text-2xl"
        }`}
      >
        {display}
      </p>
    </div>
  );
}
