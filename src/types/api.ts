// API Types based on OpenAPI specification

export interface Answer {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  answers: Answer[];
}

export interface Test {
  id: number;
  title: string;
  questions: Question[];
}

export interface UserAnswer {
  question_id: number;
  answer_id: number;
}

export interface SubmitAnswersRequest {
  answers: UserAnswer[];
}

export interface SubmitAnswersResponse {
  result_id: number;
}

export interface GetResultResponse {
  score: number;
  details: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// Session types
export interface Session {
  token: string;
  user?: {
    id: string;
    role: 'user' | 'hr';
    name: string;
  };
}

// Stats types
export interface Candidate {
  id: string;
  name: string;
  email: string;
  score: number;
  status: 'completed' | 'in_progress';
  completedAt?: string;
  startedAt: string;
}

export interface Stats {
  candidates: Candidate[];
}

// Admin types
export interface AdminStats {
  totalSessions: number;
  activeSessions: number;
  avgScore: number;
}

// Glyph types
export interface GlyphData {
  svg: string;
}

// Aeon types
export interface AeonQuestion {
  question: string;
}

export interface AeonSummary {
  summary: string;
}

export interface AeonTask {
  task: string;
} 