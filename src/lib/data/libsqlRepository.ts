import "server-only";
import { createClient, type Client } from "@libsql/client";
import type { Question } from "@/lib/domain/question";
import type { SubjectId } from "@/lib/domain/taxonomy";
import type { QuestionRepository } from "./repository";
import { rowToQuestion, type QuestionRow } from "./rowMapper";

/**
 * Implementazione del QuestionRepository che legge dal database SQLite/libSQL.
 * Usata lato server (route API).
 *
 * URL di connessione da env `DATABASE_URL`:
 *  - locale:  file:local.db          (default)
 *  - Turso:   libsql://<db>.turso.io  + DATABASE_AUTH_TOKEN
 *  - D1:      tramite adattatore dedicato in futuro
 *
 * Passare online = cambiare solo queste variabili d'ambiente, non il codice.
 */

let client: Client | null = null;

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: process.env.DATABASE_URL ?? "file:local.db",
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return client;
}

export class LibsqlQuestionRepository implements QuestionRepository {
  async getAll(): Promise<Question[]> {
    const res = await getClient().execute(
      "SELECT * FROM questions ORDER BY id",
    );
    return res.rows.map((r) => rowToQuestion(r as unknown as QuestionRow));
  }

  async getBySubject(subject: SubjectId): Promise<Question[]> {
    const res = await getClient().execute({
      sql: "SELECT * FROM questions WHERE subject = ? ORDER BY id",
      args: [subject],
    });
    return res.rows.map((r) => rowToQuestion(r as unknown as QuestionRow));
  }

  async getById(id: string): Promise<Question | undefined> {
    const res = await getClient().execute({
      sql: "SELECT * FROM questions WHERE id = ? LIMIT 1",
      args: [id],
    });
    const row = res.rows[0];
    return row ? rowToQuestion(row as unknown as QuestionRow) : undefined;
  }

  async countBySubject(): Promise<Record<SubjectId, number>> {
    const res = await getClient().execute(
      "SELECT subject, COUNT(*) as n FROM questions GROUP BY subject",
    );
    const counts = {
      reading_knowledge: 0,
      logic: 0,
      biology: 0,
      chemistry: 0,
      math: 0,
      physics: 0,
    } as Record<SubjectId, number>;
    for (const row of res.rows) {
      const subject = row.subject as SubjectId;
      if (subject in counts) counts[subject] = Number(row.n);
    }
    return counts;
  }
}

export const libsqlQuestionRepository = new LibsqlQuestionRepository();
