# SanUp v2

Piattaforma di preparazione al test di ammissione alle Professioni Sanitarie.
Local-first, con banca domande originale, spiegazioni didattiche, quiz e
tracciamento dei progressi.

## Stato: Task 1-4 completati

Fondamenta + tutte le modalita' di allenamento + banca a 300 domande (50 per
materia, conformi al Quality Firewall) + database SQLite/libSQL.

### Database (Task 4)

- Schema in `db/schema.sql` (SQLite, compatibile Turso e Cloudflare D1).
- Import dalle domande seed: `npm run db:build` (genera `local.db`).
- `LibsqlQuestionRepository` (server) legge dal DB; route API `/api/questions`.
- `ApiQuestionRepository` (client) legge via API con fallback offline al seed.
- Per andare online: cambiare solo `DATABASE_URL` / `DATABASE_AUTH_TOKEN`,
  nessuna modifica a UI o quiz engine.

### Dettaglio Task 1 (Fondamenta)

- Scaffold Next.js 16 + TypeScript + Tailwind 4 (App Router).
- Schema `Question` tipizzato e tassonomia vincolata al **DM 806 Allegato A**
  (`src/lib/domain/`).
- **Repository pattern** per la banca domande (`src/lib/data/repository.ts`):
  oggi legge moduli dati locali; per andare online in futuro basta sostituire
  l'implementazione con una API/DB remoto, senza toccare UI e quiz engine.
- Storage locale difensivo con envelope versionato (`src/lib/storage/`).
- Quiz engine (`src/lib/quiz/`) e flusso **Quiz per materia** end-to-end.
- Sezioni Home, Allenati, Errori, Salvate, Progressi, Impostazioni.
- Question Quality Firewall + test di regressione (`src/lib/data/qa.ts`).

## Comandi

```bash
npm run dev        # sviluppo
npm run build      # build di produzione
npm test           # test + QA banca domande
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Documenti di riferimento

- `docs/progetto_completo_sanup_v2.txt` — visione di prodotto.
- `docs/Decreto Ministeriale n. 806 Allegato A.pdf` — programma ufficiale.
