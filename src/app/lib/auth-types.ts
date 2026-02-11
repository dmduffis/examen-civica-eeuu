export type User = {
  id: string;
  email: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type QuizHistoryEntry = {
  id: string;
  date: string;
  correct: number;
  incorrect: number;
  total: number;
  scorePercent: number;
};

export type Profile = {
  id: string;
  email: string;
  stateCode: string | null;
  quizHistory: QuizHistoryEntry[];
};
