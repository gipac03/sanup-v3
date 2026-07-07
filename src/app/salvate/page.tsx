"use client";

import { useCallback, useEffect, useState } from "react";
import type { Question } from "@/lib/domain/question";
import { SUBJECT_BY_ID } from "@/lib/domain/taxonomy";
import { questionRepository } from "@/lib/data/repository";
import { getSaved, toggleSaved } from "@/lib/storage/progressStore";
import { Badge, Button, Card, EmptyState, PageTitle } from "@/components/ui";

export default function SalvatePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const saved = getSaved();
    const all = await questionRepository.getAll();
    const byId = new Map(all.map((q) => [q.id, q]));
    const list = saved
      .map((s) => byId.get(s.questionId))
      .filter((q): q is Question => Boolean(q));
    setQuestions(list);
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function remove(id: string) {
    toggleSaved(id);
    void refresh();
  }

  if (ready && questions.length === 0) {
    return (
      <div>
        <PageTitle title="Salvate" subtitle="Le domande che vuoi rivedere." />
        <EmptyState
          title="Nessuna domanda salvata"
          description="Durante un quiz tocca 'Salva' per aggiungere qui le domande importanti."
        />
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="Salvate" subtitle="Le domande che vuoi rivedere." />
      <div className="flex flex-col gap-3">
        {questions.map((q) => {
          const subject = SUBJECT_BY_ID[q.subject];
          return (
            <Card key={q.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary">{subject.shortLabel}</Badge>
                <Badge>{q.chapter}</Badge>
              </div>
              <p className="mt-3 text-sm font-semibold">{q.question}</p>
              <p className="mt-2 text-sm text-success">
                Corretta: {q.correctOption}) {q.options[q.correctOption]}
              </p>
              <p className="mt-2 text-sm text-muted">
                {q.explanationDetails.whyCorrect}
              </p>
              <div className="mt-4">
                <Button variant="secondary" onClick={() => remove(q.id)}>
                  Rimuovi
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
