"use client";

import { useEffect, useState } from "react";
import { computeOverview, type OverviewStats } from "@/lib/stats";
import { SUBJECT_BY_ID, type SubjectId } from "@/lib/domain/taxonomy";
import { getSessions, type SessionRecord } from "@/lib/storage/progressStore";
import { Card, EmptyState, PageTitle, StatCard } from "@/components/ui";

interface SubjectStat {
  subject: SubjectId;
  accuracy: number;
  total: number;
}

function AccuracyChart({ sessions }: { sessions: SessionRecord[] }) {
  if (sessions.length < 2) return null;

  const W = 300;
  const H = 96;
  const PAD = { top: 10, right: 10, bottom: 10, left: 34 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const vals = sessions.map((s) => Math.round(s.accuracy * 100));
  const xOf = (i: number) => PAD.left + (i / (vals.length - 1)) * cW;
  const yOf = (v: number) => PAD.top + (1 - v / 100) * cH;

  const linePts = vals.map((v, i) => `${xOf(i)},${yOf(v)}`).join(" ");
  const areaD = [
    `M${xOf(0)},${H - PAD.bottom}`,
    ...vals.map((v, i) => `L${xOf(i)},${yOf(v)}`),
    `L${xOf(vals.length - 1)},${H - PAD.bottom}`,
    "Z",
  ].join(" ");

  const last = vals[vals.length - 1];
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const trend = last > avg ? "↑" : last < avg ? "↓" : "→";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Andamento accuratezza</p>
        <span className="font-[family-name:var(--font-space)] text-sm font-bold text-primary">
          {last}%{" "}
          <span className="text-xs font-normal text-muted">{trend} ultima sessione</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16c7c3" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#16c7c3" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={PAD.left} y1={yOf(v)} x2={W - PAD.right} y2={yOf(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={PAD.left - 5} y={yOf(v) + 3.5} textAnchor="end" fontSize="8" fill="rgba(143,176,199,0.55)">{v}%</text>
          </g>
        ))}
        <path d={areaD} fill="url(#areaFill)" />
        <polyline points={linePts} fill="none" stroke="#16c7c3" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {vals.map((v, i) => (
          <circle key={i} cx={xOf(i)} cy={yOf(v)} r={i === vals.length - 1 ? 3.5 : 2.5} fill={i === vals.length - 1 ? "#16c7c3" : "#1276e3"}>
            <title>Sessione {i + 1}: {v}%</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

function SubjectBar({ subject, accuracy, total }: SubjectStat) {
  const pct = Math.round(accuracy * 100);
  const colorText =
    pct >= 70 ? "text-success" : pct >= 50 ? "text-warning" : "text-danger";
  const colorBar =
    pct >= 70
      ? "bg-gradient-to-r from-success to-success/70"
      : pct >= 50
        ? "bg-gradient-to-r from-warning to-warning/70"
        : "bg-gradient-to-r from-danger to-danger/70";

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{SUBJECT_BY_ID[subject].shortLabel}</span>
        <span className={`font-[family-name:var(--font-space)] text-sm font-bold ${colorText}`}>
          {pct}%
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${colorBar} transition-[width] duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-0.5 text-xs text-muted">{total} domande risposte</p>
    </div>
  );
}

export default function ProgressiPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);

  useEffect(() => {
    setStats(computeOverview());
    const s = getSessions();
    setSessions(s);

    const map = new Map<string, { correct: number; total: number }>();
    for (const sess of s) {
      if (sess.subject === "mixed") continue;
      const cur = map.get(sess.subject) ?? { correct: 0, total: 0 };
      cur.correct += sess.correctCount;
      cur.total += sess.total;
      map.set(sess.subject, cur);
    }
    setSubjectStats(
      [...map.entries()]
        .map(([subject, { correct, total }]) => ({
          subject: subject as SubjectId,
          accuracy: total === 0 ? 0 : correct / total,
          total,
        }))
        .sort((a, b) => b.accuracy - a.accuracy)
    );
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
  const weak = stats?.weakestSubject && SUBJECT_BY_ID[stats.weakestSubject].shortLabel;
  const strong = stats?.strongestSubject && SUBJECT_BY_ID[stats.strongestSubject].shortLabel;

  const chronological = [...sessions]
    .sort((a, b) => a.completedAt - b.completedAt)
    .slice(-10);

  const recent = [...sessions].reverse().slice(0, 8);

  return (
    <div>
      <PageTitle title="Progressi" subtitle="Stai migliorando?" />

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Accuratezza media" value={accuracy} />
        <StatCard label="Sessioni completate" value={stats ? String(stats.totalSessions) : "-"} />
        <StatCard label="Materia più forte" value={strong || "-"} />
        <StatCard label="Da rinforzare" value={weak || "-"} />
      </div>

      {/* Grafico andamento */}
      {chronological.length >= 2 && (
        <Card className="mt-4">
          <AccuracyChart sessions={chronological} />
        </Card>
      )}

      {/* Statistiche per materia */}
      {subjectStats.length > 0 && (
        <Card className="mt-4">
          <p className="text-sm font-semibold">Per materia</p>
          <p className="mt-1 text-sm text-muted">
            Media sulle sessioni per singola materia.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {subjectStats.map((s) => (
              <SubjectBar key={s.subject} {...s} />
            ))}
          </div>
        </Card>
      )}

      {/* Insight */}
      {strong && weak ? (
        <Card className="mt-4">
          <p className="text-sm">
            Hai completato {stats?.totalSessions} sessioni. La tua materia più
            forte è <strong>{strong}</strong>, quella da rinforzare è{" "}
            <strong>{weak}</strong>.
          </p>
        </Card>
      ) : null}

      {/* Lista sessioni */}
      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-muted">Ultime sessioni</h2>
        <div className="flex flex-col gap-2">
          {recent.map((s) => {
            const label =
              s.subject === "mixed" ? "Quiz misto" : SUBJECT_BY_ID[s.subject].shortLabel;
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
