import { describe, expect, it } from "vitest";
import { buildExam, buildMixed, examTargetTotal, EXAM_PROFILE } from "./exam";
import { LocalQuestionRepository } from "@/lib/data/repository";
import { seedQuestions } from "@/lib/data/seed";
import { SUBJECTS } from "@/lib/domain/taxonomy";

const repo = new LocalQuestionRepository(seedQuestions);

describe("composizione esame e quiz misto", () => {
  it("examTargetTotal somma le domande per materia del profilo", () => {
    const expected = SUBJECTS.reduce(
      (sum, s) => sum + EXAM_PROFILE.perSubject[s.id],
      0,
    );
    expect(examTargetTotal()).toBe(expected);
  });

  it("buildExam non supera le domande disponibili per materia (cap)", async () => {
    const exam = await buildExam(repo);
    // Il seed ha 4 domande per materia: l'esame ne prende al piu' 4 per materia.
    const bySubject = new Map<string, number>();
    for (const q of exam) {
      bySubject.set(q.subject, (bySubject.get(q.subject) ?? 0) + 1);
    }
    for (const s of SUBJECTS) {
      const want = EXAM_PROFILE.perSubject[s.id];
      const available = seedQuestions.filter((q) => q.subject === s.id).length;
      expect(bySubject.get(s.id) ?? 0).toBe(Math.min(want, available));
    }
  });

  it("buildExam non produce id duplicati", async () => {
    const exam = await buildExam(repo);
    const ids = exam.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("buildMixed rispetta il totale richiesto (o il massimo disponibile)", async () => {
    const mixed = await buildMixed(repo, 10);
    expect(mixed.length).toBeLessThanOrEqual(10);
    expect(mixed.length).toBeGreaterThan(0);
    const ids = mixed.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("buildMixed pesca da piu' materie", async () => {
    const mixed = await buildMixed(repo, 12);
    const subjects = new Set(mixed.map((q) => q.subject));
    expect(subjects.size).toBeGreaterThan(1);
  });
});
