"use client";

import { useState } from "react";
import type { Question } from "@/lib/domain/question";
import { questionRepository } from "@/lib/data/repository";
import { buildExam, EXAM_PROFILE } from "@/lib/quiz/exam";
import { QuizRunner } from "@/components/QuizRunner";
import { Badge, Button, Card, PageTitle } from "@/components/ui";

export default function SimulazionePage() {
  const [questions, setQuestions] = useState<Question[] | null>(null);

  async function start() {
    const selected = await buildExam(questionRepository);
    if (selected.length === 0) return;
    setQuestions(selected);
  }

  if (questions) {
    return (
      <QuizRunner
        questions={questions}
        mode="exam"
        sessionSubject="mixed"
        timerSeconds={EXAM_PROFILE.durationSeconds}
        onRestart={() => setQuestions(null)}
        restartLabel="Nuova simulazione"
      />
    );
  }

  const minutes = Math.round(EXAM_PROFILE.durationSeconds / 60);

  return (
    <div>
      <PageTitle
        title="Simulazione esame"
        subtitle="Prova realistica con timer e risultato finale."
      />

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="warning">con timer</Badge>
          <Badge tone="primary">tutte le materie</Badge>
        </div>
        <p className="mt-3 text-sm text-muted">
          Durante la prova non vedrai le spiegazioni: rispondi e vai avanti, come
          all&apos;esame vero. Al termine ricevi punteggio, tempo impiegato e
          riepilogo per materia.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm">
          <li className="flex justify-between">
            <span className="text-muted">Durata</span>
            <span className="font-medium">{minutes} minuti</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted">Spiegazioni durante la prova</span>
            <span className="font-medium">No</span>
          </li>
        </ul>
      </Card>

      <div className="mt-6">
        <Button onClick={start} className="w-full">
          Inizia simulazione
        </Button>
      </div>
    </div>
  );
}
