"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OptionKey, Question } from "@/lib/domain/question";
import { SUBJECT_BY_ID, type SubjectId } from "@/lib/domain/taxonomy";
import { scoreQuiz, type QuizAnswer } from "@/lib/quiz/engine";
import {
  isSaved,
  recordError,
  recordSession,
  toggleSaved,
} from "@/lib/storage/progressStore";
import { QuestionView } from "@/components/QuestionView";
import { Badge, Button, ButtonLink, Card, PageTitle } from "@/components/ui";

/**
 * Motore di svolgimento condiviso dalle tre modalita' di allenamento.
 * Gestisce il ciclo domanda-per-domanda, la registrazione di errori e sessione,
 * il timer (solo esame) e la schermata di risultato con riepilogo per materia.
 */
export function QuizRunner({
  questions,
  mode,
  sessionSubject,
  timerSeconds,
  onRestart,
  restartLabel = "Nuovo quiz",
}: {
  questions: Question[];
  mode: "practice" | "exam";
  sessionSubject: SubjectId | "mixed";
  timerSeconds?: number;
  onRestart: () => void;
  restartLabel?: string;
}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [finished, setFinished] = useState(false);
  // "done" = l'utente ha completato l'ultima domanda; "expired" = timer scaduto.
  const [done, setDone] = useState(false);
  const [expired, setExpired] = useState(false);
  const [savedTick, setSavedTick] = useState(0);
  void savedTick;

  function handleAnswer(selected: OptionKey, correct: boolean) {
    const q = questions[current];
    setAnswers((prev) => [...prev, { questionId: q.id, selected, correct }]);
    if (!correct) {
      recordError({
        questionId: q.id,
        subject: q.subject,
        chapter: q.chapter,
        selected,
      });
    }
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setDone(true);
    }
  }

  const expire = useCallback(() => setExpired(true), []);

  // Completamento centralizzato: gira dopo il render, quindi `answers` e' gia'
  // sincronizzato (incluso l'ultimo click). Salva la sessione una sola volta.
  useEffect(() => {
    if (finished || (!done && !expired)) return;
    const result = scoreQuiz(answers);
    recordSession({
      subject: sessionSubject,
      total: result.total,
      correctCount: result.correctCount,
      accuracy: result.accuracy,
    });
    setFinished(true);
  }, [done, expired, finished, answers, sessionSubject]);

  if (finished) {
    return (
      <ResultView
        questions={questions}
        answers={answers}
        mode={mode}
        onRestart={onRestart}
        restartLabel={restartLabel}
      />
    );
  }

  const q = questions[current];

  return (
    <div>
      {mode === "exam" && timerSeconds ? (
        <ExamTimer seconds={timerSeconds} onExpire={expire} />
      ) : null}
      <QuestionView
        key={q.id}
        question={q}
        index={current}
        total={questions.length}
        mode={mode}
        saved={isSaved(q.id)}
        onToggleSave={() => {
          toggleSaved(q.id);
          setSavedTick((t) => t + 1);
        }}
        onAnswer={handleAnswer}
        onNext={handleNext}
        isLast={current === questions.length - 1}
      />
    </div>
  );
}

function ExamTimer({
  seconds,
  onExpire,
}: {
  seconds: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const expired = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining === 0 && !expired.current) {
      expired.current = true;
      onExpire();
    }
  }, [remaining, onExpire]);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const low = remaining <= 60;

  return (
    <div
      className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-2.5 ${
        low ? "border-danger bg-danger/10" : "border-border bg-card"
      }`}
      aria-live="polite"
    >
      <span className="text-sm font-medium text-muted">Tempo rimanente</span>
      <span
        className={`font-mono text-lg font-semibold ${low ? "text-danger" : ""}`}
      >
        {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
      </span>
    </div>
  );
}

function ResultView({
  questions,
  answers,
  mode,
  onRestart,
  restartLabel,
}: {
  questions: Question[];
  answers: QuizAnswer[];
  mode: "practice" | "exam";
  onRestart: () => void;
  restartLabel: string;
}) {
  const result = useMemo(() => scoreQuiz(answers), [answers]);
  const pct = Math.round(result.accuracy * 100);

  // Riepilogo per materia (utile soprattutto in simulazione, sez. 9).
  const perSubject = useMemo(() => {
    const byId = new Map(questions.map((q) => [q.id, q]));
    const acc = new Map<SubjectId, { correct: number; total: number }>();
    for (const a of answers) {
      const q = byId.get(a.questionId);
      if (!q) continue;
      const cur = acc.get(q.subject) ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (a.correct) cur.correct += 1;
      acc.set(q.subject, cur);
    }
    return [...acc.entries()].map(([subject, s]) => ({
      subject,
      ...s,
      accuracy: s.total === 0 ? 0 : s.correct / s.total,
    }));
  }, [questions, answers]);

  const best =
    perSubject.length > 0
      ? [...perSubject].sort((a, b) => b.accuracy - a.accuracy)[0]
      : null;
  const worst =
    perSubject.length > 0
      ? [...perSubject].sort((a, b) => a.accuracy - b.accuracy)[0]
      : null;

  return (
    <div>
      <PageTitle
        title={mode === "exam" ? "Simulazione conclusa" : "Risultato"}
        subtitle="Ecco com'e' andata."
      />
      <Card className="text-center">
        <p className="font-[family-name:var(--font-space)] text-5xl font-bold text-primary">
          {pct}%
        </p>
        <p className="mt-2 text-sm text-muted">
          {result.correctCount} risposte corrette su {result.total}
        </p>
        <div className="mt-3">
          <Badge tone={pct >= 60 ? "success" : "warning"}>
            {pct >= 60 ? "Buon lavoro" : "Continua ad allenarti"}
          </Badge>
        </div>
      </Card>

      {mode === "exam" && best && worst && best.subject !== worst.subject ? (
        <Card className="mt-4">
          <p className="text-sm">
            Materia migliore: <strong>{SUBJECT_BY_ID[best.subject].shortLabel}</strong>{" "}
            ({Math.round(best.accuracy * 100)}%). Da rinforzare:{" "}
            <strong>{SUBJECT_BY_ID[worst.subject].shortLabel}</strong> (
            {Math.round(worst.accuracy * 100)}%).
          </p>
        </Card>
      ) : null}

      {perSubject.length > 1 ? (
        <section className="mt-4">
          <h2 className="mb-2 text-sm font-semibold text-muted">Per materia</h2>
          <div className="flex flex-col gap-2">
            {perSubject.map((s) => (
              <div
                key={s.subject}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <span className="font-medium">
                  {SUBJECT_BY_ID[s.subject].shortLabel}
                </span>
                <span className="text-muted">
                  {s.correct}/{s.total} · {Math.round(s.accuracy * 100)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-4 text-sm text-muted">
        Le domande sbagliate sono finite nel ripasso: le trovi nella sezione
        Errori.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Button onClick={onRestart} className="w-full">
          {restartLabel}
        </Button>
        <ButtonLink href="/errori" variant="secondary" className="w-full">
          Ripassa errori
        </ButtonLink>
      </div>
    </div>
  );
}
