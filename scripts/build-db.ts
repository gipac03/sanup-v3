/**
 * Costruisce/aggiorna il database della banca domande a partire dai moduli seed
 * (fonte di verita' tipizzata e validata dal Quality Firewall).
 *
 * Esecuzione: `npm run db:build`
 *
 * I moduli seed restano la fonte: rilanciando questo script dopo ogni fase di
 * scaling, le nuove domande finiscono automaticamente nel database.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@libsql/client";
import { seedQuestions } from "../src/lib/data/seed/index";
import { questionToRow } from "../src/lib/data/rowMapper";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, "..", "db", "schema.sql");

async function main() {
  const url = process.env.DATABASE_URL ?? "file:local.db";
  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const schema = readFileSync(schemaPath, "utf8");
  await client.executeMultiple(schema);

  // Ricostruzione idempotente: svuota e reinserisce tutte le domande.
  await client.execute("DELETE FROM questions");

  const inserts = seedQuestions.map((q) => {
    const row = questionToRow(q);
    return {
      sql: `INSERT INTO questions
        (id, subject, chapter, topic, difficulty, question, options,
         correct_option, explanation, explanation_details, source_type,
         originality_status, protected_source_risk, production_eligible)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        row.id,
        row.subject,
        row.chapter,
        row.topic,
        row.difficulty,
        row.question,
        row.options,
        row.correct_option,
        row.explanation,
        row.explanation_details,
        row.source_type,
        row.originality_status,
        row.protected_source_risk,
        row.production_eligible,
      ],
    };
  });

  await client.batch(inserts, "write");

  const count = await client.execute("SELECT COUNT(*) AS n FROM questions");
  console.log(`Database aggiornato (${url}): ${count.rows[0].n} domande.`);
}

main().catch((err) => {
  console.error("Errore nella costruzione del database:", err);
  process.exit(1);
});
