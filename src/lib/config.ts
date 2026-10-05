// Composition (35 = 15 signs + 20 rules): official, ilsos.gov workbook DSD DS 9.28 p.4 (SRC-002).
// passCorrect: 80% of 35 = 28, confirmed by 92 Ill. Adm. Code 1030.80 (SRC-002, DEC-019).
export const EXAM = { total: 35, signs: 15, rules: 20, passCorrect: 28 }
// Per-topic readiness threshold (implementer-defined per DEC-002).
export const TOPIC_THRESHOLD = { minAnswered: 10, minAccuracy: 0.8 }
// A topic quiz session asks this many questions, preferring ones not yet answered correctly (DEC-033).
export const QUIZ_LENGTH = 10
