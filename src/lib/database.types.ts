export type UserRole = 'user' | 'moderator' | 'admin';
export type SlangStatus = 'pending' | 'approved' | 'rejected';
export type VoteType = 'up' | 'down';

export interface AppUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface SlangData {
  id: string;
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
  updated_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  slang_id: string;
  vote_type: VoteType;
  created_at: string;
}
