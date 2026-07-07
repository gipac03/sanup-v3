"use client";

import { useState } from "react";
import {
  OPTION_KEYS,
  type OptionKey,
  type Question,
} from "@/lib/domain/question";
import { SUBJECT_BY_ID } from "@/lib/domain/taxonomy";
import { Badge, Button } from "@/components/ui";

/**
 * Schermata di una singola domanda (sez. 15). Gestisce selezione, conferma e
 * feedback con spiegazione. Notifica il risultato al genitore tramite onAnswer.
 */
/**
 * mode:
 *  - "practice": seleziona -> Conferma -> feedback + spiegazione -> Avanti.
 *  - "exam": seleziona -> Avanti (nessun feedback ne' spiegazione durante la prova).
 */
export function QuestionView({
  question,
  index,
  total,
  saved,
  onToggleSave,
  onAnswer,
  onNext,
  isLast,
  mode = "practice",
}: {
  question: Question;
  index: number;
  total: number;
  saved: boolean;
  onToggleSave: () => void;
  onAnswer: (selected: OptionKey, correct: boolean) => void;
  onNext: () => void;
  isLast: boolean;
  mode?: "practice" | "exam";
}) {
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const subject = SUBJECT_BY_ID[question.subject];
  const showFeedback = mode === "practice" && confirmed;

  function confirm() {
    if (selected === null) return;
    const correct = selected === question.correctOption;
    setConfirmed(true);
    onAnswer(selected, correct);
  }

  function submitExam() {
    if (selected === null) return;
    onAnswer(selected, selected === question.correctOption);
    onNext();
  }

  function optionClasses(key: OptionKey): string {
    const base =
      "w-full text-left rounded-xl border p-3.5 flex items-start gap-3 transition-colors";
    if (!showFeedback) {
      return `${base} ${
        selected === key
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:bg-border/30"
      }`;
    }
    if (key === question.correctOption) {
      return `${base} border-success bg-success/10`;
    }
    if (key === selected) {
      return `${base} border-danger bg-danger/10`;
    }
    return `${base} border-border bg-card opacity-60`;
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Domanda {index + 1} di {total}
        </span>
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          className="inline-flex items-center gap-1.5 font-medium text-primary"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M6 3h12v18l-6-4-6 4V3Z" />
          </svg>
          {saved ? "Salvata" : "Salva"}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((index + (showFeedback ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="primary">{subject.shortLabel}</Badge>
        <Badge>{question.chapter}</Badge>
        <Badge
          tone={
            question.difficulty === "hard"
              ? "danger"
              : question.difficulty === "medium"
                ? "warning"
                : "success"
          }
        >
          {question.difficulty === "hard"
            ? "difficile"
            : question.difficulty === "medium"
              ? "media"
              : "facile"}
        </Badge>
      </div>

      <h2 className="mt-4 text-lg font-semibold leading-snug">
        {question.question}
      </h2>

      <div className="mt-4 flex flex-col gap-2.5" role="radiogroup" aria-label="Opzioni">
        {OPTION_KEYS.map((key) => {
          const isRight = showFeedback && key === question.correctOption;
          const isWrongPick =
            showFeedback && key === selected && key !== question.correctOption;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected === key}
              disabled={confirmed}
              onClick={() => setSelected(key)}
              className={optionClasses(key)}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                {key}
              </span>
              <span className="flex-1 text-sm">{question.options[key]}</span>
              {isRight ? (
                <span className="text-xs font-semibold text-success">
                  corretta
                </span>
              ) : null}
              {isWrongPick ? (
                <span className="text-xs font-semibold text-danger">
                  tua scelta
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {mode === "exam" ? (
        <div className="mt-5">
          <Button onClick={submitExam} disabled={selected === null} className="w-full">
            {isLast ? "Consegna" : "Avanti"}
          </Button>
        </div>
      ) : (
        <>
          {!confirmed ? (
            <div className="mt-5">
              <Button
                onClick={confirm}
                disabled={selected === null}
                className="w-full"
              >
                Conferma
              </Button>
            </div>
          ) : (
            <>
              <Explanation question={question} />
              <div className="mt-5">
                <Button onClick={onNext} className="w-full">
                  {isLast ? "Vedi risultato" : "Prossima domanda"}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Explanation({ question }: { question: Question }) {
  const d = question.explanationDetails;
  const wrongEntries = Object.entries(d.wrongOptions) as [OptionKey, string][];
  return (
    <div className="mt-5 rounded-xl border border-border bg-background p-4">
      <p className="text-sm font-semibold text-success">Perche' e' corretta</p>
      <p className="mt-1 text-sm">{d.whyCorrect}</p>

      {wrongEntries.length > 0 ? (
        <div className="mt-3">
          <p className="text-sm font-semibold">Perche' le altre sono sbagliate</p>
          <ul className="mt-1 space-y-1 text-sm text-muted">
            {wrongEntries.map(([key, text]) => (
              <li key={key}>
                <span className="font-semibold text-foreground">{key})</span>{" "}
                {text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {d.testTrap ? (
        <p className="mt-3 text-sm">
          <span className="font-semibold">Trappola del test: </span>
          {d.testTrap}
        </p>
      ) : null}
      {d.memoryAnchor ? (
        <p className="mt-2 text-sm">
          <span className="font-semibold">Da ricordare: </span>
          {d.memoryAnchor}
        </p>
      ) : null}
      {d.linkedReview ? (
        <p className="mt-2 text-xs text-muted">Ripasso collegato: {d.linkedReview}</p>
      ) : null}
    </div>
  );
}
