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

// Aeon Messenger types (new version)
export interface AeonMessage {
  id: number;
  text?: string;
  message_type: string;
  reply_to_message_id?: number;
  chat_id: number;
  sender_id: number;
  sender: MessageSender;
  media_url?: string;
  media_type?: string;
  media_size?: number;
  media_duration?: number;
  forward_from_user_id?: number;
  forward_from_chat_id?: number;
  is_edited: boolean;
  is_deleted: boolean;
  read_by: number[];
  created_at: string;
  updated_at?: string;
}

export interface MessageSender {
  id: number;
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  profile_photo_url?: string;
}

export interface AeonChat {
  id: number;
  title?: string;
  chat_type: string;
  description?: string;
  photo_url?: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  members: UserInChat[];
}

export interface UserInChat {
  id: number;
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  profile_photo_url?: string;
  is_admin: boolean;
  joined_at: string;
}

export interface AeonChatList {
  id: number;
  title?: string;
  chat_type: string;
  photo_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export interface AeonMessageList {
  messages: AeonMessage[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AeonChatCreate {
  title?: string;
  chat_type: string;
  description?: string;
  photo_url?: string;
  member_ids: number[];
}

export interface AeonChatUpdate {
  title?: string;
  description?: string;
  photo_url?: string;
}

export interface AeonMessageCreate {
  text?: string;
  message_type: string;
  reply_to_message_id?: number;
  chat_id: number;
}

export interface AeonMessageUpdate {
  text?: string;
}

export interface AeonCurrentUser {
  id: number;
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  profile_photo_url?: string;
}

export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  language_code?: string;
  is_premium: boolean;
  is_admin: boolean;
  profile_photo_url?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  subordinates: User[];
  managers: User[];
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  language_code?: string;
  profile_photo_url?: string;
  bio?: string;
  is_admin?: boolean;
}

export interface UserList {
  users: User[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SubordinateBase {
  subordinate_id: number;
} 