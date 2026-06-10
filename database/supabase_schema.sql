-- ═══════════════════════════════════════════════════════════════
-- TheraQuest Enterprise — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Interactions Table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interactions (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id         TEXT NOT NULL,
    sentiment       TEXT,
    anxiety_score   FLOAT CHECK (anxiety_score >= 0 AND anxiety_score <= 1),
    engagement_score FLOAT CHECK (engagement_score >= 0 AND engagement_score <= 1),
    quest_title     TEXT,
    total_xp        INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at DESC);

-- ── Quest Completions Table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quest_completions (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id         TEXT NOT NULL,
    quest_title     TEXT NOT NULL,
    xp_earned       INTEGER DEFAULT 0,
    completed_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_completions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (demo mode — tighten for production)
CREATE POLICY "Allow all" ON interactions FOR ALL USING (true);
CREATE POLICY "Allow all" ON quest_completions FOR ALL USING (true);

-- ── Helpful View: User Progress Summary ───────────────────────────────────────
CREATE OR REPLACE VIEW user_progress AS
SELECT
    user_id,
    COUNT(*)                                    AS total_sessions,
    AVG(anxiety_score)                          AS avg_anxiety,
    AVG(engagement_score)                       AS avg_engagement,
    SUM(total_xp)                               AS total_xp_earned,
    MAX(created_at)                             AS last_active,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS sessions_this_week
FROM interactions
GROUP BY user_id;
