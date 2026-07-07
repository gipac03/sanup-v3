import type { Question } from "@/lib/domain/question";
import type { SubjectId } from "@/lib/domain/taxonomy";
import { seedQuestions } from "./seed";
import { ApiQuestionRepository } from "./apiRepository";

/**
 * Livello di astrazione per l'accesso alla banca domande.
 *
 * Perche' esiste: SanUp oggi e' local-first (le domande vivono in moduli dati
 * inclusi nel bundle). In futuro l'app andra' online e le domande arriveranno
 * da un database o da una API remota. Tutto il resto dell'app (quiz engine, UI)
 * dipende SOLO da questa interfaccia, mai dai dati grezzi: per passare online
 * bastera' scrivere una nuova implementazione (es. ApiQuestionRepository) e
 * cambiare una riga in `questionRepository`, senza toccare pagine o componenti.
 *
 * L'interfaccia e' asincrona di proposito, cosi' la firma non cambiera' quando
 * dietro ci sara' una fetch di rete.
 */
export interface QuestionRepository {
  getAll(): Promise<Question[]>;
  getBySubject(subject: SubjectId): Promise<Question[]>;
  getById(id: string): Promise<Question | undefined>;
  countBySubject(): Promise<Record<SubjectId, number>>;
}

/** Implementazione local-first: legge dai moduli dati inclusi nel bundle. */
export class LocalQuestionRepository implements QuestionRepository {
  private readonly questions: Question[];

  constructor(questions: Question[] = seedQuestions) {
    this.questions = questions;
  }

  async getAll(): Promise<Question[]> {
    return this.questions;
  }

  async getBySubject(subject: SubjectId): Promise<Question[]> {
    return this.questions.filter((q) => q.subject === subject);
  }

  async getById(id: string): Promise<Question | undefined> {
    return this.questions.find((q) => q.id === id);
  }

  async countBySubject(): Promise<Record<SubjectId, number>> {
    const counts = {
      reading_knowledge: 0,
      logic: 0,
      biology: 0,
      chemistry: 0,
      math: 0,
      physics: 0,
    } as Record<SubjectId, number>;
    for (const q of this.questions) counts[q.subject] += 1;
    return counts;
  }
}

/**
 * Istanza usata dal client dell'app: legge la banca dal database tramite la
 * route API, con fallback offline ai moduli seed (vedi ApiQuestionRepository).
 * Punto unico da cui dipende tutta l'app: cambiare backend = cambiare qui.
 */
export const questionRepository: QuestionRepository = new ApiQuestionRepository();
