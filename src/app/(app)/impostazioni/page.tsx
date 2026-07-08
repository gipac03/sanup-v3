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
  const [sound, setSound] = useState<SoundSettings>({ sfx: true, music: false });

  useEffect(() => {
    setSound(getSoundSettings());
  }, []);

  function toggleSound(key: keyof SoundSettings) {
    unlockAudio();
    setSound(setSoundSettings({ [key]: !sound[key] }));
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
          Suoni di feedback durante il quiz e musica soft di sottofondo.
        </p>
        <div className="mt-4 divide-y divide-border/40">
          <ToggleRow
            label="Effetti sonori"
            description="Click e feedback su risposte corrette / sbagliate"
            on={sound.sfx}
            onToggle={() => toggleSound("sfx")}
          />
          <ToggleRow
            label="Musica di sottofondo"
            description="Melodia ambient silenziosa durante la sessione"
            on={sound.music}
            onToggle={() => toggleSound("music")}
          />
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

function ToggleRow({
  label,
  description,
  on,
  onToggle,
}: {
  label: string;
  description: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug">{label}</p>
        <p className="mt-0.5 text-xs text-muted leading-snug">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          on ? "bg-primary/80" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            on ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
