"use client";

import { useEffect, useState } from "react";
import { removeStorage } from "@/lib/storage/safeStorage";
import { Button, Card, PageTitle } from "@/components/ui";
import {
  getSoundSettings,
  setSoundSettings,
  unlockAudio,
  type SoundSettings,
} from "@/lib/audio/sound";

export default function ImpostazioniPage() {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [sound, setSound] = useState<SoundSettings>({ sfx: true });

  useEffect(() => {
    setSound(getSoundSettings());
  }, []);

  function toggleSfx() {
    unlockAudio();
    setSound(setSoundSettings({ sfx: !sound.sfx }));
  }

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

      {/* Audio */}
      <Card>
        <p className="text-sm font-semibold">Audio</p>
        <p className="mt-1 text-sm text-muted">
          Feedback sonori durante il quiz: click, risposta corretta e sbagliata.
        </p>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug">Effetti sonori</p>
            <p className="mt-0.5 text-xs text-muted leading-snug">
              Suoni di feedback su risposte e navigazione
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={sound.sfx}
            aria-label="Effetti sonori"
            onClick={toggleSfx}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
              sound.sfx ? "bg-primary/80" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                sound.sfx ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Reset progressi */}
      <Card className="mt-4">
        <p className="text-sm font-semibold">Reset progressi</p>
        <p className="mt-1 text-sm text-muted">
          Cancella errori, domande salvate e sessioni completate. L&apos;azione
          non è reversibile.
        </p>
        {!confirming ? (
          <div className="mt-4">
            <Button variant="danger" onClick={() => setConfirming(true)}>
              Reset progressi
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            <Button variant="danger" onClick={resetAll}>
              Conferma reset
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Annulla
            </Button>
          </div>
        )}
        {done && (
          <p className="mt-3 text-sm text-success">Progressi azzerati.</p>
        )}
      </Card>

      {/* Versione */}
      <Card className="mt-4">
        <p className="text-sm font-semibold">Versione</p>
        <p className="mt-1 text-sm text-muted">SanUp v3 · 1.500 domande</p>
      </Card>
    </div>
  );
}
