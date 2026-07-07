import { describe, expect, it } from "vitest";
import { seedQuestions } from "./seed";
import { runQa, findDuplicateIds, findDuplicateQuestions } from "./qa";
import { SUBJECTS } from "@/lib/domain/taxonomy";

describe("Banca domande seed - Question Quality Firewall", () => {
  it("non contiene alcun problema di qualita'", () => {
    const issues = runQa(seedQuestions);
    if (issues.length > 0) {
      // Messaggio leggibile in caso di fallimento.
      const report = issues
        .map((i) => `  - ${i.questionId}: ${i.problem}`)
        .join("\n");
      throw new Error(`QA fallito, ${issues.length} problemi:\n${report}`);
    }
    expect(issues).toHaveLength(0);
  });

  it("non ha id duplicati", () => {
    expect(findDuplicateIds(seedQuestions)).toHaveLength(0);
  });

  it("non ha domande duplicate", () => {
    expect(findDuplicateQuestions(seedQuestions)).toHaveLength(0);
  });

  it("copre tutte e 6 le materie del DM 806", () => {
    const subjects = new Set(seedQuestions.map((q) => q.subject));
    for (const s of SUBJECTS) {
      expect(subjects.has(s.id)).toBe(true);
    }
  });
});
