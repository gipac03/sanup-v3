"use client";

import { useEffect, useState } from "react";
import { computeOverview, type OverviewStats } from "@/lib/stats";
import { SUBJECT_BY_ID } from "@/lib/domain/taxonomy";
import { ButtonLink, Card, PageTitle, StatCard } from "@/components/ui";

export default function HomePage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);

  // Le statistiche vivono in localStorage: si leggono solo lato client dopo il
  // mount, per evitare mismatch di hydration.
  useEffect(() => {
    setStats(computeOverview());
  }, []);

  const accuracy =
    stats && stats.overallAccuracy !== null
      ? `${Math.round(stats.overallAccuracy * 100)}%`
      : "-";
  const weakest =
    stats && stats.weakestSubject
      ? SUBJECT_BY_ID[stats.weakestSubject].shortLabel
      : "-";

  return (
    <div>
      <PageTitle
        title="Bentornato 👋"
        subtitle="Allenati oggi su cio' che ti fa perdere piu' punti."
      />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Accuratezza" value={accuracy} />
        <StatCard label="Errori aperti" value={stats ? String(stats.openErrors) : "-"} />
        <StatCard
          label="Sessioni completate"
          value={stats ? String(stats.totalSessions) : "-"}
        />
        <StatCard label="Materia da rinforzare" value={weakest} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <ButtonLink href="/allenati">Allenati ora</ButtonLink>
        <ButtonLink href="/errori" variant="secondary">
          Ripassa errori
        </ButtonLink>
      </div>

      {stats && stats.totalSessions === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-muted">
            Non hai ancora completato allenamenti. Inizia il tuo primo quiz per
            materia: bastano 5 domande per cominciare a vedere i tuoi progressi.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
