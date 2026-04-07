export type UserRole = 'user' | 'moderator' | 'admin';
export type SlangStatus = 'pending' | 'approved' | 'rejected';
export type VoteType = 'up' | 'down';

export interface AppUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  show_nsfw: boolean;
  created_at: string;
}

export interface SlangData {
  id: string;
  slug: string;
  word: string;
  pronunciation: string | null;
  meaning: string;
  meaning_burmese: string | null;
  examples: string[];
  author_id: string;
  author_name: string | null;
  status: SlangStatus;
  upvotes: number;
  downvotes: number;
  views: number;
  view_history: Record<string, number>;
  created_at: string;
  is_nsfw: boolean;
  updated_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  slang_id: string;
  vote_type: VoteType;
  created_at: string;
}

export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface Suggestion {
  id: string;
  slang_id: string;
  user_id: string;
  user_name: string | null;
  field: string;
  value: string;
  status: SuggestionStatus;
  created_at: string;
}
