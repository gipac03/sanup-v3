import { Badge, ButtonLink, Card, PageTitle } from "@/components/ui";

/** Allenati (sez. 6): tre modalita', tutte attive. */
export default function AllenatiPage() {
  return (
    <div>
      <PageTitle title="Allenati" subtitle="Scegli come vuoi allenarti oggi." />

      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Quiz per materia</h2>
            <Badge tone="success">senza timer</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Allenati su una sola materia, scegliendo quante domande fare.
          </p>
          <div className="mt-4">
            <ButtonLink href="/allenati/materia">Inizia</ButtonLink>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Quiz misto</h2>
            <Badge tone="success">senza timer</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Domande da piu' materie, senza timer. Perfetto per allenarti con
            calma.
          </p>
          <div className="mt-4">
            <ButtonLink href="/allenati/misto">Inizia</ButtonLink>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Simulazione esame</h2>
            <Badge tone="warning">con timer</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Prova realistica con timer e risultato finale.
          </p>
          <div className="mt-4">
            <ButtonLink href="/allenati/simulazione">Inizia</ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
