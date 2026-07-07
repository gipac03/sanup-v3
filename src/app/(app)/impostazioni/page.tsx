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

/**
 * Impostazioni (sez. 13). In Task 1 e' presente il reset progressi (con
 * conferma). Toggle suoni/tema e import/export backup arrivano nelle fasi
 * successive.
 */
export default function ImpostazioniPage() {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [sound, setSound] = useState<SoundSettings>({ sfx: true, music: true });

  useEffect(() => {
    setSound(getSoundSettings());
  }, []);

  function toggleSound(key: keyof SoundSettings) {
    unlockAudio(); // il click e' un gesto utente: sblocca l'audio
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

      <Card>
        <p className="text-sm font-semibold">Reset progressi</p>
        <p className="mt-1 text-sm text-muted">
          Cancella errori, domande salvate e sessioni completate. L&apos;azione
          non e&apos; reversibile.
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
        {done ? (
          <p className="mt-3 text-sm text-success">Progressi azzerati.</p>
        ) : null}
      </Card>

      <Card className="mt-4">
        <p className="text-sm font-semibold">Audio</p>
        <p className="mt-1 text-sm text-muted">
          Effetti ai click e feedback nei quiz, musica soft di sottofondo.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <ToggleRow
            label="Effetti sonori"
            on={sound.sfx}
            onToggle={() => toggleSound("sfx")}
          />
          <ToggleRow
            label="Musica di sottofondo"
            on={sound.music}
            onToggle={() => toggleSound("music")}
          />
        </div>
      </Card>

      <Card className="mt-4">
        <p className="text-sm font-semibold">Versione</p>
        <p className="mt-1 text-sm text-muted">SanUp v3 · 1.500 domande</p>
      </Card>
    </div>
  );
}

function ToggleRow({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          on ? "bg-primary/80" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
