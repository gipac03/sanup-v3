"use client";

import { useState } from "react";
import { removeStorage } from "@/lib/storage/safeStorage";
import { Button, Card, PageTitle } from "@/components/ui";

/**
 * Impostazioni (sez. 13). In Task 1 e' presente il reset progressi (con
 * conferma). Toggle suoni/tema e import/export backup arrivano nelle fasi
 * successive.
 */
export default function ImpostazioniPage() {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  function resetAll() {
    removeStorage("errors");
    removeStorage("saved");
    removeStorage("sessions");
    setConfirming(false);
    setDone(true);
  }

  return (
    <div>
      <PageTitle title="Impostazioni" subtitle="Gestisci la tua esperienza." />

      <Card>
        <p className="text-sm font-semibold">Reset progressi</p>
        <p className="mt-1 text-sm text-muted">
          Cancella errori, domande salvate e sessioni completate. L&apos;azione
          non e&apos; reversibile.
        </p>
        {!confirming ? (
          <div className="mt-4">
            <Button variant="secondary" onClick={() => setConfirming(true)}>
              Reset progressi
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            <Button onClick={resetAll}>Conferma reset</Button>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Annulla
            </Button>
          </div>
        )}
        {done ? (
          <p className="mt-3 text-sm text-success">Progressi azzerati.</p>
        ) : null}
      </Card>

      <Card className="mt-4">
        <p className="text-sm font-semibold">Versione</p>
        <p className="mt-1 text-sm text-muted">SanUp v2 · anteprima (Task 1)</p>
      </Card>
    </div>
  );
}
