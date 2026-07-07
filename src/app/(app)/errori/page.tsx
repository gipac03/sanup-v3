"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/lib/domain/question";
import { SUBJECT_BY_ID } from "@/lib/domain/taxonomy";
import { questionRepository } from "@/lib/data/repository";
import {
  getErrors,
  setErrorResolved,
  type ErrorEntry,
} from "@/lib/storage/progressStore";
import { Badge, Button, Card, EmptyState, PageTitle } from "@/components/ui";

export default function ErroriPage() {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [byId, setById] = useState<Record<string, Question>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const all = await questionRepository.getAll();
      const map: Record<string, Question> = {};
      for (const q of all) map[q.id] = q;
      setById(map);
      setErrors(getErrors());
      setReady(true);
    })();
  }, []);

  function resolve(id: string, resolved: boolean) {
    setErrors(setErrorResolved(id, resolved));
  }

  const open = errors.filter((e) => !e.resolved);
  const resolved = errors.filter((e) => e.resolved);

  if (ready && errors.length === 0) {
    return (
      <div>
        <PageTitle title="Errori" subtitle="Trasforma gli sbagli in punti recuperati." />
        <EmptyState
          title="Nessun errore da ripassare"
          description="Quando sbagli una domanda in un quiz, finisce qui per il ripasso."
        />
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="Errori" subtitle="Trasforma gli sbagli in punti recuperati." />

      {open.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted">
            Da ripassare ({open.length})
          </h2>
          <div className="flex flex-col gap-3">
            {open.map((e) => (
              <ErrorCard
                key={e.questionId}
                entry={e}
                question={byId[e.questionId]}
                onResolve={() => resolve(e.questionId, true)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {resolved.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-muted">
            Risolti ({resolved.length})
          </h2>
          <div className="flex flex-col gap-3">
            {resolved.map((e) => (
              <ErrorCard
                key={e.questionId}
                entry={e}
                question={byId[e.questionId]}
                onResolve={() => resolve(e.questionId, false)}
                resolved
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ErrorCard({
  entry,
  question,
  onResolve,
  resolved = false,
}: {
  entry: ErrorEntry;
  question?: Question;
  onResolve: () => void;
  resolved?: boolean;
}) {
  if (!question) return null;
  const subject = SUBJECT_BY_ID[entry.subject];
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary">{subject.shortLabel}</Badge>
        <Badge>{entry.chapter}</Badge>
        {entry.timesWrong > 1 ? (
          <Badge tone="danger">sbagliata {entry.timesWrong}x</Badge>
        ) : null}
      </div>
      <p className="mt-3 text-sm font-semibold">{question.question}</p>
      <p className="mt-2 text-sm text-danger">
        La tua risposta: {entry.selected}) {question.options[entry.selected]}
      </p>
      <p className="mt-1 text-sm text-success">
        Corretta: {question.correctOption}){" "}
        {question.options[question.correctOption]}
      </p>
      <p className="mt-2 text-sm text-muted">
        {question.explanationDetails.whyCorrect}
      </p>
      <div className="mt-4">
        <Button variant="secondary" onClick={onResolve}>
          {resolved ? "Riporta tra gli aperti" : "Segna come risolto"}
        </Button>
      </div>
    </Card>
  );
}
