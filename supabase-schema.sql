-- Ban Sagar: Myanmar Slang Dictionary
-- Supabase Migration Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================================
-- 1. ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE slang_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE vote_type AS ENUM ('up', 'down');

-- ============================================================
-- 2. TABLES
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE slangs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL CHECK (char_length(word) BETWEEN 1 AND 100),
  pronunciation TEXT CHECK (pronunciation IS NULL OR char_length(pronunciation) BETWEEN 1 AND 100),
  meaning TEXT NOT NULL CHECK (char_length(meaning) BETWEEN 1 AND 1000),
  meaning_burmese TEXT CHECK (meaning_burmese IS NULL OR char_length(meaning_burmese) BETWEEN 1 AND 1000),
  examples TEXT[] DEFAULT '{}',
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT,
  status slang_status NOT NULL DEFAULT 'pending',
  upvotes INTEGER NOT NULL DEFAULT 0 CHECK (upvotes >= 0),
  downvotes INTEGER NOT NULL DEFAULT 0 CHECK (downvotes >= 0),
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  view_history JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slang_id UUID NOT NULL REFERENCES slangs(id) ON DELETE CASCADE,
  vote_type vote_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slang_id)
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX idx_slangs_status ON slangs(status);
CREATE INDEX idx_slangs_author_id ON slangs(author_id);
CREATE INDEX idx_slangs_word_lower ON slangs(lower(word));
CREATE INDEX idx_slangs_created_at ON slangs(created_at DESC);
CREATE INDEX idx_votes_user_slang ON votes(user_id, slang_id);
CREATE INDEX idx_votes_slang_id ON votes(slang_id);

-- ============================================================
-- 4. TRIGGERS: Auto-admin elevation
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'saiwailyanhtun@gmail.com' THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION elevate_admin_on_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'saiwailyanhtun@gmail.com' AND NEW.role != 'admin' THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_updated
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION elevate_admin_on_update();

-- ============================================================
-- 5. TRIGGERS: Auto updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER slangs_updated_at
  BEFORE UPDATE ON slangs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. RPC: Atomic vote handling
-- ============================================================
CREATE OR REPLACE FUNCTION handle_vote(
  p_user_id UUID,
  p_slang_id UUID,
  p_vote_type vote_type
)
RETURNS JSON AS $$
DECLARE
  existing_vote vote_type;
  result JSON;
BEGIN
  SELECT v.vote_type INTO existing_vote
  FROM votes v
  WHERE v.user_id = p_user_id AND v.slang_id = p_slang_id;

  IF existing_vote IS NOT NULL THEN
    IF existing_vote = p_vote_type THEN
      DELETE FROM votes WHERE user_id = p_user_id AND slang_id = p_slang_id;
      IF p_vote_type = 'up' THEN
        UPDATE slangs SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = p_slang_id;
      ELSE
        UPDATE slangs SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = p_slang_id;
      END IF;
      result := json_build_object('action', 'removed', 'vote_type', null);
    ELSE
      UPDATE votes SET vote_type = p_vote_type WHERE user_id = p_user_id AND slang_id = p_slang_id;
      IF p_vote_type = 'up' THEN
        UPDATE slangs SET upvotes = upvotes + 1, downvotes = GREATEST(downvotes - 1, 0) WHERE id = p_slang_id;
      ELSE
        UPDATE slangs SET downvotes = downvotes + 1, upvotes = GREATEST(upvotes - 1, 0) WHERE id = p_slang_id;
      END IF;
      result := json_build_object('action', 'switched', 'vote_type', p_vote_type);
    END IF;
  ELSE
    INSERT INTO votes (user_id, slang_id, vote_type) VALUES (p_user_id, p_slang_id, p_vote_type);
    IF p_vote_type = 'up' THEN
      UPDATE slangs SET upvotes = upvotes + 1 WHERE id = p_slang_id;
    ELSE
      UPDATE slangs SET downvotes = downvotes + 1 WHERE id = p_slang_id;
    END IF;
    result := json_build_object('action', 'created', 'vote_type', p_vote_type);
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. RPC: Increment view count
-- ============================================================
CREATE OR REPLACE FUNCTION increment_view(p_slang_id UUID)
RETURNS VOID AS $$
DECLARE
  today TEXT := to_char(now(), 'YYYY-MM-DD');
BEGIN
  UPDATE slangs
  SET
    views = views + 1,
    view_history = view_history || jsonb_build_object(today, COALESCE((view_history->>today)::int, 0) + 1)
  WHERE id = p_slang_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. HELPER FUNCTIONS for RLS
-- ============================================================
CREATE OR REPLACE FUNCTION is_moderator_or_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM users WHERE id = p_user_id AND role IN ('moderator', 'admin'));
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE slangs ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile or mods can read all"
  ON users FOR SELECT
  USING (id = auth.uid() OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Slangs policies
CREATE POLICY "Anyone can read approved slangs or mods see all"
  ON slangs FOR SELECT
  USING (
    status = 'approved'
    OR is_moderator_or_admin(auth.uid())
    OR (auth.uid() IS NOT NULL AND author_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create slangs"
  ON slangs FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
  );

CREATE POLICY "Authors or mods can update slangs"
  ON slangs FOR UPDATE
  USING (
    is_moderator_or_admin(auth.uid())
    OR (auth.uid() IS NOT NULL AND author_id = auth.uid() AND status = 'pending')
  );

CREATE POLICY "Only moderators can delete slangs"
  ON slangs FOR DELETE
  USING (is_moderator_or_admin(auth.uid()));

-- Votes policies
CREATE POLICY "Users can read own votes"
  ON votes FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can insert own votes"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update own votes"
  ON votes FOR UPDATE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- ============================================================
-- 10. REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE slangs;
