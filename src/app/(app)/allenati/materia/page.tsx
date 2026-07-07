"use client";

import { useState } from "react";
import type { Question } from "@/lib/domain/question";
import { SUBJECTS, type SubjectId } from "@/lib/domain/taxonomy";
import { buildQuiz, type QuestionCount } from "@/lib/quiz/engine";
import { questionRepository } from "@/lib/data/repository";
import { QuizRunner } from "@/components/QuizRunner";
import { Button, Card, PageTitle } from "@/components/ui";

const COUNT_OPTIONS: QuestionCount[] = [5, 10, 15, 20, "all"];

const SUBJECT_ICON: Record<string, string> = {
  biology: "🔬",
  chemistry: "⚗️",
  physics: "⚛️",
  math: "📐",
  logic: "🧩",
  reading: "📖",
};

export default function QuizMateriaPage() {
  const [subject, setSubject] = useState<SubjectId | null>(null);
  const [count, setCount] = useState<QuestionCount>(5);
  const [questions, setQuestions] = useState<Question[] | null>(null);

  async function startQuiz() {
    if (!subject) return;
    const pool = await questionRepository.getBySubject(subject);
    const selected = buildQuiz(pool, { count });
    if (selected.length === 0) return;
    setQuestions(selected);
  }

  if (questions && subject) {
    return (
      <QuizRunner
        questions={questions}
        mode="practice"
        sessionSubject={subject}
        onRestart={() => setQuestions(null)}
      />
    );
  }

  return (
    <div>
      <PageTitle
        title="Quiz per materia"
        subtitle="Scegli la materia e quante domande fare."
      />

      <Card>
        <p className="text-sm font-semibold">Materia</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSubject(s.id)}
              aria-pressed={subject === s.id}
              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left text-sm font-medium transition-all ${
                subject === s.id
                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_24px_rgba(22,199,195,0.15)]"
                  : "border-border bg-white/[0.02] hover:border-primary/40 hover:bg-primary/[0.04]"
              }`}
            >
              <span className="text-lg leading-none">{SUBJECT_ICON[s.id]}</span>
              {s.shortLabel}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <p className="text-sm font-semibold">Numero di domande</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {COUNT_OPTIONS.map((c) => (
            <button
              key={String(c)}
              type="button"
              onClick={() => setCount(c)}
              aria-pressed={count === c}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                count === c
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card hover:bg-border/30"
              }`}
            >
              {c === "all" ? "Tutte" : c}
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-6">
        <Button onClick={startQuiz} disabled={!subject} className="w-full">
          Avvia quiz
        </Button>
      </div>
    </div>
  );
}
