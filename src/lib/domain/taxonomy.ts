/**
 * Tassonomia ufficiale derivata dal DM n. 806 - Allegato A
 * (Programmi relativi ai quesiti delle prove di ammissione ai corsi di laurea
 * delle professioni sanitarie).
 *
 * Fonte: docs/Decreto Ministeriale n. 806 Allegato A.pdf
 *
 * Il decreto definisce 6 aree. Questa tassonomia e' la fonte vincolante per i
 * campi `subject` / `chapter` di ogni domanda: una domanda non puo' dichiarare
 * un chapter che non compare qui.
 */

export type SubjectId =
  | "reading_knowledge"
  | "logic"
  | "biology"
  | "chemistry"
  | "math"
  | "physics";

export interface SubjectDef {
  id: SubjectId;
  /** Etichetta mostrata allo studente (italiano). */
  label: string;
  /** Etichetta breve per badge/navigazione. */
  shortLabel: string;
  /** Capitoli ammessi, testualmente coerenti col decreto. */
  chapters: string[];
}

export const SUBJECTS: SubjectDef[] = [
  {
    id: "reading_knowledge",
    label: "Competenze di lettura e conoscenze acquisite negli studi",
    shortLabel: "Lettura",
    chapters: [
      "Comprensione del testo",
      "Lessico e coesione testuale",
      "Inferenza e specificita' informative",
      "Storia e geografia",
      "Istituzioni nazionali e internazionali",
      "Ambito giuridico, economico e cittadinanza",
    ],
  },
  {
    id: "logic",
    label: "Ragionamento logico e problemi",
    shortLabel: "Logica",
    chapters: [
      "Sillogismi e quantificatori",
      "Condizioni necessarie e sufficienti",
      "Insiemi e relazioni",
      "Proporzioni verbali",
      "Sequenze e serie",
      "Problemi e vincoli",
    ],
  },
  {
    id: "biology",
    label: "Biologia",
    shortLabel: "Biologia",
    chapters: [
      "La chimica dei viventi",
      "La cellula",
      "Membrana e trasporti",
      "Ciclo cellulare: mitosi e meiosi",
      "Riproduzione ed ereditarieta'",
      "Genetica mendeliana e classica",
      "Genetica molecolare",
      "Genetica umana",
      "Mutazioni ed evoluzione",
      "Biotecnologie",
      "Anatomia e fisiologia umana",
      "Bioenergetica",
    ],
  },
  {
    id: "chemistry",
    label: "Chimica",
    shortLabel: "Chimica",
    chapters: [
      "Costituzione della materia",
      "Leggi dei gas perfetti",
      "Struttura dell'atomo",
      "Sistema periodico",
      "Legame chimico",
      "Chimica inorganica e nomenclatura",
      "Reazioni e stechiometria",
      "Soluzioni e concentrazione",
      "Equilibri in soluzione acquosa",
      "Cinetica e catalisi",
      "Ossidoriduzione",
      "Acidi e basi, pH",
      "Chimica organica",
    ],
  },
  {
    id: "math",
    label: "Matematica",
    shortLabel: "Matematica",
    chapters: [
      "Insiemi numerici e algebra",
      "Proporzioni e percentuali",
      "Potenze, radicali e logaritmi",
      "Equazioni e disequazioni",
      "Funzioni",
      "Geometria piana",
      "Geometria analitica",
      "Goniometria e trigonometria",
      "Probabilita' e statistica",
    ],
  },
  {
    id: "physics",
    label: "Fisica",
    shortLabel: "Fisica",
    chapters: [
      "Grandezze fisiche e misura",
      "Cinematica",
      "Dinamica",
      "Lavoro ed energia",
      "Meccanica dei fluidi",
      "Termodinamica",
      "Elettricita' ed elettromagnetismo",
    ],
  },
];

export const SUBJECT_BY_ID: Record<SubjectId, SubjectDef> = SUBJECTS.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<SubjectId, SubjectDef>,
);

export function isValidChapter(subject: SubjectId, chapter: string): boolean {
  return SUBJECT_BY_ID[subject]?.chapters.includes(chapter) ?? false;
}
