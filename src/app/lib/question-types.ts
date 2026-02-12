/**
 * Aligns with GET /api/question from examen_civica_backend.
 * questionText = Spanish, questionTextEn = optional English.
 * answers: answerText (Spanish), optional answerTextEn (English).
 */

export type QuestionAnswer = {
  _id?: string;
  answerText: string;
  answerTextEn?: string;
  isCorrect: boolean;
};

export type QuestionItem = {
  _id: string;
  questionText: string;
  questionTextEn?: string;
  isStateSpecific?: boolean;
  answers: QuestionAnswer[];
};

export type DisplayLang = "es" | "en";

export function questionDisplayText(q: QuestionItem, lang: DisplayLang): string {
  if (lang === "en" && q.questionTextEn) return q.questionTextEn;
  return q.questionText;
}

export function answerDisplayText(a: QuestionAnswer, lang: DisplayLang): string {
  if (lang === "en" && a.answerTextEn) return a.answerTextEn;
  return a.answerText;
}
