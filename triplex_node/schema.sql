CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    
    token_version INTEGER DEFAULT 0 NOT NULL,     -- This is the key security field
    last_password_change TIMESTAMPTZ DEFAULT NOW(),
    
    name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(50) DEFAULT 'user',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    username VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS trip_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_cost NUMERIC(12, 2),
    total_cost_currency CHAR(3),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
    CREATE TYPE stop_role AS ENUM ('start', 'waypoint', 'end');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS trip_plan_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_plan_id UUID NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    role stop_role NOT NULL DEFAULT 'waypoint',
    location VARCHAR(255),
    place_id VARCHAR(255),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    description TEXT,
    cost NUMERIC(12, 2),
    currency CHAR(3),
    sort_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_plan_stops_plan_id ON trip_plan_stops(trip_plan_id);
CREATE INDEX IF NOT EXISTS idx_trip_plan_stops_sort ON trip_plan_stops(trip_plan_id, sort_order);

CREATE OR REPLACE FUNCTION sync_trip_plan_total_cost()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_trip_plan_id      UUID;
    v_currency_count    INT;
    v_currency          CHAR(3);
    v_total             NUMERIC(12, 2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_trip_plan_id := OLD.trip_plan_id;
    ELSE
        v_trip_plan_id := NEW.trip_plan_id;
    END IF;

    SELECT
        COUNT(DISTINCT currency),
        MIN(currency)
    INTO v_currency_count, v_currency
    FROM trip_plan_stops
    WHERE trip_plan_id = v_trip_plan_id
      AND cost IS NOT NULL;

    IF v_currency_count = 1 THEN
        SELECT COALESCE(SUM(cost), 0)
        INTO v_total
        FROM trip_plan_stops
        WHERE trip_plan_id = v_trip_plan_id
          AND cost IS NOT NULL;

        UPDATE trip_plans
        SET
            total_cost          = v_total,
            total_cost_currency = v_currency
        WHERE id = v_trip_plan_id;
    ELSE
        UPDATE trip_plans
        SET total_cost = NULL
        WHERE id = v_trip_plan_id;
    END IF; 

    RETURN NULL;
END;
$$;

-- Trigger 
DROP TRIGGER IF EXISTS trg_sync_total_cost ON trip_plan_stops;
CREATE TRIGGER trg_sync_total_cost
    AFTER INSERT OR DELETE OR UPDATE OF cost, currency
    ON trip_plan_stops
    FOR EACH ROW
    EXECUTE FUNCTION sync_trip_plan_total_cost();

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g. 'trip_plan', 'media', 'text'
    trip_plan_id UUID REFERENCES trip_plans(id) ON DELETE SET NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reposts_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS repost_id UUID REFERENCES posts(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_trip_plan ON posts(trip_plan_id);
CREATE INDEX IF NOT EXISTS idx_posts_repost_id ON posts(repost_id);

CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cloud_url TEXT NOT NULL,
    public_id TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE media ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE media ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_media_post_id ON media(post_id, sort_order);


-- ─────────────────────────────────────────────
-- COMMENTS (supports top-level & replies)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id           UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID        REFERENCES comments(id) ON DELETE SET NULL,  -- NULL = top-level comment; SET = reply
    content           TEXT        NOT NULL,
    likes_count       INTEGER     DEFAULT 0 NOT NULL,
    replies_count     INTEGER     DEFAULT 0 NOT NULL,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ                                              -- soft delete
);

ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS replies_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_comments_post        ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent      ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_parent ON comments(post_id, parent_comment_id);


-- ─────────────────────────────────────────────
-- POST REACTIONS  (scalable emoji reactions)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_reactions (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(20) NOT NULL DEFAULT 'like',   -- like | love | haha | wow | sad | cry | angry
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Migration for existing databases that had UNIQUE(post_id, user_id, type)
DELETE FROM post_reactions pr1
USING post_reactions pr2
WHERE pr1.post_id = pr2.post_id
  AND pr1.user_id = pr2.user_id
  AND pr1.created_at < pr2.created_at;

ALTER TABLE post_reactions DROP CONSTRAINT IF EXISTS post_reactions_post_id_user_id_type_key;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'post_reactions_post_user_unique'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'post_reactions_post_id_user_id_key'
    ) THEN
        ALTER TABLE post_reactions ADD CONSTRAINT post_reactions_post_user_unique UNIQUE (post_id, user_id);
    END IF;
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON post_reactions(user_id);

-- ─────────────────────────────────────────────
-- COMMENT REACTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comment_reactions (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID        NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(20) NOT NULL DEFAULT 'like',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Migration for existing databases that had UNIQUE(comment_id, user_id, type)
DELETE FROM comment_reactions cr1
USING comment_reactions cr2
WHERE cr1.comment_id = cr2.comment_id
  AND cr1.user_id = cr2.user_id
  AND cr1.created_at < cr2.created_at;

ALTER TABLE comment_reactions DROP CONSTRAINT IF EXISTS comment_reactions_comment_id_user_id_type_key;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'comment_reactions_comment_user_unique'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'comment_reactions_comment_id_user_id_key'
    ) THEN
        ALTER TABLE comment_reactions ADD CONSTRAINT comment_reactions_comment_user_unique UNIQUE (comment_id, user_id);
    END IF;
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user    ON comment_reactions(user_id);

-- ─────────────────────────────────────────────
-- COMMENT ATTACHMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comment_attachments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id  UUID        NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    type        VARCHAR(20) NOT NULL,   -- image | video | sticker | gif | link | post
    storage_key TEXT,                   -- Cloudinary public_id / CDN key
    metadata    JSONB,                  -- flexible: { width, height, mime_type } or { post_id } etc.
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comment_attachments_comment ON comment_attachments(comment_id);

-- ─────────────────────────────────────────────
-- FOLLOWS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
    follower_id  UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- ─────────────────────────────────────────────
-- COUNTER TRIGGERS
-- ─────────────────────────────────────────────

-- 1. posts.likes_count  ←  post_reactions
CREATE OR REPLACE FUNCTION sync_post_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_post_likes ON post_reactions;
CREATE TRIGGER trg_sync_post_likes
    AFTER INSERT OR DELETE ON post_reactions
    FOR EACH ROW EXECUTE FUNCTION sync_post_likes_count();

-- 2. posts.comments_count  ←  comments (top-level only)
CREATE OR REPLACE FUNCTION sync_post_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NULL THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NULL AND OLD.deleted_at IS NULL THEN
        UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_post_comments ON comments;
CREATE TRIGGER trg_sync_post_comments
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION sync_post_comments_count();

-- 3. comments.replies_count  ←  comments (parent_comment_id SET)
CREATE OR REPLACE FUNCTION sync_comment_replies_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL THEN
        UPDATE comments SET replies_count = replies_count + 1 WHERE id = NEW.parent_comment_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NOT NULL THEN
        UPDATE comments SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = OLD.parent_comment_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_comment_replies ON comments;
CREATE TRIGGER trg_sync_comment_replies
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION sync_comment_replies_count();

-- 4. comments.likes_count  ←  comment_reactions
CREATE OR REPLACE FUNCTION sync_comment_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_comment_likes ON comment_reactions;
CREATE TRIGGER trg_sync_comment_likes
    AFTER INSERT OR DELETE ON comment_reactions
    FOR EACH ROW EXECUTE FUNCTION sync_comment_likes_count();

-- 5. posts.reposts_count  ←  posts (repost_id IS NOT NULL)
CREATE OR REPLACE FUNCTION sync_post_reposts_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.repost_id IS NOT NULL THEN
        UPDATE posts SET reposts_count = reposts_count + 1 WHERE id = NEW.repost_id;
    ELSIF TG_OP = 'DELETE' AND OLD.repost_id IS NOT NULL THEN
        UPDATE posts SET reposts_count = GREATEST(reposts_count - 1, 0) WHERE id = OLD.repost_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL AND NEW.repost_id IS NOT NULL THEN
            UPDATE posts SET reposts_count = GREATEST(reposts_count - 1, 0) WHERE id = NEW.repost_id;
        ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL AND NEW.repost_id IS NOT NULL THEN
            UPDATE posts SET reposts_count = reposts_count + 1 WHERE id = NEW.repost_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_post_reposts ON posts;
CREATE TRIGGER trg_sync_post_reposts
    AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON posts
    FOR EACH ROW EXECUTE FUNCTION sync_post_reposts_count();