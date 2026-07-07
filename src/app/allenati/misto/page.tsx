"use client";

import { useState } from "react";
import type { Question } from "@/lib/domain/question";
import { questionRepository } from "@/lib/data/repository";
import { buildMixed } from "@/lib/quiz/exam";
import { QuizRunner } from "@/components/QuizRunner";
import { Badge, Button, Card, PageTitle } from "@/components/ui";

const COUNT_OPTIONS = [10, 20, 30] as const;

export default function QuizMistoPage() {
  const [count, setCount] = useState<number>(20);
  const [questions, setQuestions] = useState<Question[] | null>(null);

  async function start() {
    const selected = await buildMixed(questionRepository, count);
    if (selected.length === 0) return;
    setQuestions(selected);
  }

  if (questions) {
    return (
      <QuizRunner
        questions={questions}
        mode="practice"
        sessionSubject="mixed"
        onRestart={() => setQuestions(null)}
        restartLabel="Nuovo quiz misto"
      />
    );
  }

  return (
    <div>
      <PageTitle title="Quiz misto" subtitle="Allenamento completo senza timer." />

      <Card>
        <div className="flex items-center gap-2">
          <Badge tone="success">senza timer</Badge>
          <Badge tone="primary">piu' materie</Badge>
        </div>
        <p className="mt-3 text-sm text-muted">
          Domande da tutte le materie, con una distribuzione simile a quella
          dell&apos;esame. Perfetto per allenarti con calma ogni giorno.
        </p>
      </Card>

      <Card className="mt-4">
        <p className="text-sm font-semibold">Numero di domande</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {COUNT_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCount(c)}
              aria-pressed={count === c}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                count === c
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card hover:bg-border/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-6">
        <Button onClick={start} className="w-full">
          Avvia quiz misto
        </Button>
      </div>
    </div>
  );
}
