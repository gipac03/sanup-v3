import { describe, expect, it } from "vitest";
import { buildQuiz, scoreQuiz, isCorrect } from "./engine";
import type { Question } from "@/lib/domain/question";

function makeQuestion(id: string): Question {
  return {
    id,
    subject: "biology",
    chapter: "La cellula",
    topic: "test",
    difficulty: "easy",
    question: "Domanda di prova sufficientemente lunga?",
    options: { A: "a", B: "b", C: "c", D: "d", E: "e" },
    correctOption: "A",
    explanation: "spiegazione",
    explanationDetails: {
      whyCorrect: "perche' A",
      wrongOptions: {
        B: "B e' sbagliata perche'...",
        C: "C e' sbagliata perche'...",
        D: "D e' sbagliata perche'...",
        E: "E e' sbagliata perche'...",
      },
    },
    sourceType: "original",
    originalityStatus: "original",
    protectedSourceRisk: false,
    productionEligible: true,
  };
}

const pool = Array.from({ length: 8 }, (_, i) => makeQuestion(`q-${i}`));

describe("quiz engine", () => {
  it("buildQuiz limita al numero richiesto", () => {
    expect(buildQuiz(pool, { count: 5 })).toHaveLength(5);
  });

  it("buildQuiz con 'all' restituisce tutte le domande", () => {
    expect(buildQuiz(pool, { count: "all" })).toHaveLength(pool.length);
  });

  it("buildQuiz non chiede piu' domande di quante disponibili", () => {
    expect(buildQuiz(pool, { count: 20 })).toHaveLength(pool.length);
  });

  it("buildQuiz non muta il pool originale", () => {
    const before = pool.map((q) => q.id);
    buildQuiz(pool, { count: 5 });
    expect(pool.map((q) => q.id)).toEqual(before);
  });

  it("isCorrect confronta con correctOption", () => {
    expect(isCorrect(pool[0], "A")).toBe(true);
    expect(isCorrect(pool[0], "B")).toBe(false);
  });

  it("scoreQuiz calcola accuratezza", () => {
    const result = scoreQuiz([
      { questionId: "a", selected: "A", correct: true },
      { questionId: "b", selected: "B", correct: false },
      { questionId: "c", selected: "A", correct: true },
      { questionId: "d", selected: "A", correct: true },
    ]);
    expect(result.total).toBe(4);
    expect(result.correctCount).toBe(3);
    expect(result.accuracy).toBeCloseTo(0.75);
  });

  it("scoreQuiz gestisce zero risposte senza dividere per zero", () => {
    expect(scoreQuiz([]).accuracy).toBe(0);
  });
});
