"use client";

import { useEffect, useState } from "react";
import { computeOverview, type OverviewStats } from "@/lib/stats";
import { SUBJECT_BY_ID } from "@/lib/domain/taxonomy";
import { getSessions, type SessionRecord } from "@/lib/storage/progressStore";
import { Card, EmptyState, PageTitle, StatCard } from "@/components/ui";

export default function ProgressiPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    setStats(computeOverview());
    setSessions(getSessions());
  }, []);

  if (stats && stats.totalSessions === 0) {
    return (
      <div>
        <PageTitle title="Progressi" subtitle="Stai migliorando?" />
        <EmptyState
          title="Ancora nessun dato"
          description="Completa il tuo primo quiz per iniziare a vedere l'andamento."
        />
      </div>
    );
  }

  const accuracy =
    stats && stats.overallAccuracy !== null
      ? `${Math.round(stats.overallAccuracy * 100)}%`
      : "-";
  const weak =
    stats?.weakestSubject && SUBJECT_BY_ID[stats.weakestSubject].shortLabel;
  const strong =
    stats?.strongestSubject && SUBJECT_BY_ID[stats.strongestSubject].shortLabel;

  const recent = [...sessions].reverse().slice(0, 8);

  return (
    <div>
      <PageTitle title="Progressi" subtitle="Stai migliorando?" />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Accuratezza media" value={accuracy} />
        <StatCard
          label="Sessioni completate"
          value={stats ? String(stats.totalSessions) : "-"}
        />
        <StatCard label="Materia piu' forte" value={strong || "-"} />
        <StatCard label="Da rinforzare" value={weak || "-"} />
      </div>

      {strong && weak ? (
        <Card className="mt-4">
          <p className="text-sm">
            Hai completato {stats?.totalSessions} sessioni. La tua materia piu'
            forte e' <strong>{strong}</strong>, quella da rinforzare e'{" "}
            <strong>{weak}</strong>.
          </p>
        </Card>
      ) : null}

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-muted">Ultime sessioni</h2>
        <div className="flex flex-col gap-2">
          {recent.map((s) => {
            const label =
              s.subject === "mixed"
                ? "Quiz misto"
                : SUBJECT_BY_ID[s.subject].shortLabel;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <span className="font-medium">{label}</span>
                <span className="text-muted">
                  {s.correctCount}/{s.total} · {Math.round(s.accuracy * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
