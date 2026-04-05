-- Performance indexes for Quranlab
-- Run this once on your Supabase SQL editor to dramatically speed up
-- the most frequent queries (leaderboard, user progress, challenge
-- progress, streak activity).
--
-- All statements are CREATE INDEX IF NOT EXISTS, safe to re-run.

-- challenge_progress is the hottest table (every exercise writes here
-- and every page reads progress by user_id).
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user
  ON challenge_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_challenge
  ON challenge_progress (user_id, challenge_id);

-- user_progress lookups by active course (/learn, /lecons)
CREATE INDEX IF NOT EXISTS idx_user_progress_active_course
  ON user_progress (active_course_id);

-- Leaderboard global ranking (top users by points)
CREATE INDEX IF NOT EXISTS idx_user_progress_points
  ON user_progress (points DESC);

-- League queries: members of a group for a given week
CREATE INDEX IF NOT EXISTS idx_leagues_group
  ON leagues (group_id);

CREATE INDEX IF NOT EXISTS idx_leagues_user_week
  ON leagues (user_id, week_start);

CREATE INDEX IF NOT EXISTS idx_leagues_week_tier
  ON leagues (week_start, tier);

-- Weekly XP lookups (per user per week + per week for group ranking)
CREATE INDEX IF NOT EXISTS idx_weekly_xp_user_week
  ON weekly_xp (user_id, week_start);

CREATE INDEX IF NOT EXISTS idx_weekly_xp_week
  ON weekly_xp (week_start);

-- Streak activity: lookups for "last N days" for a given user
CREATE INDEX IF NOT EXISTS idx_streak_activity_user_date
  ON streak_activity (user_id, date DESC);

-- Unlocked lists: lookups per user
CREATE INDEX IF NOT EXISTS idx_unlocked_lists_user
  ON unlocked_lists (user_id);

-- Challenges and lessons joins
CREATE INDEX IF NOT EXISTS idx_challenges_lesson
  ON challenges (lesson_id, "order");

CREATE INDEX IF NOT EXISTS idx_lessons_unit
  ON lessons (unit_id, "order");

CREATE INDEX IF NOT EXISTS idx_lessons_list
  ON lessons (list_id, level_order);

CREATE INDEX IF NOT EXISTS idx_units_course
  ON units (course_id, "order");

-- user_subscription lookup by user for billing checks
CREATE INDEX IF NOT EXISTS idx_user_subscription_user
  ON user_subscription (user_id);

-- Optional: analyze the tables after adding indexes so the planner
-- picks them up immediately.
ANALYZE challenge_progress;
ANALYZE user_progress;
ANALYZE leagues;
ANALYZE weekly_xp;
ANALYZE streak_activity;
ANALYZE unlocked_lists;
ANALYZE challenges;
ANALYZE lessons;
ANALYZE units;
ANALYZE user_subscription;
