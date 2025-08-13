-- CertPath Database Schema for Supabase PostgreSQL
-- Based on docs/station3/Table.csv design

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (Supabase Auth integration)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Supabase Auth user ID (will be populated automatically)
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL CHECK (length(display_name) >= 1 AND length(display_name) <= 200),
    email TEXT NOT NULL UNIQUE,
    target_certification TEXT CHECK (length(target_certification) <= 200),
    start_date TIMESTAMPTZ,
    is_progress_public BOOLEAN NOT NULL DEFAULT TRUE,
    profile_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Certifications table (資格テンプレート)
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 200),
    description TEXT NOT NULL CHECK (length(description) <= 2000),
    category TEXT NOT NULL,
    estimated_period INTEGER NOT NULL CHECK (estimated_period > 0),
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('初級', '中級', '上級')),
    official_url TEXT,
    passing_score INTEGER,
    exam_fee INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Projects table (ユーザーの学習プロジェクト)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL CHECK (length(project_name) >= 1 AND length(project_name) <= 200),
    target_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'done')),
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    total_tasks INTEGER,
    completed_tasks INTEGER,
    total_estimated_hours INTEGER,
    studied_hours INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tasks table (タスク管理)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
    description TEXT CHECK (length(description) <= 2000),
    estimated_hours INTEGER NOT NULL CHECK (estimated_hours > 0),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    copy_count INTEGER NOT NULL DEFAULT 0 CHECK (copy_count >= 0),
    original_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    order_index INTEGER NOT NULL DEFAULT 0 CHECK (order_index >= 0),
    notes TEXT CHECK (length(notes) <= 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Constraint: is_public can only be true when is_completed is true
    CONSTRAINT check_public_only_when_completed CHECK (
        NOT is_public OR (is_public AND is_completed)
    ),
    -- Constraint: completed_at must be set when is_public is true
    CONSTRAINT check_completed_at_when_public CHECK (
        NOT is_public OR (is_public AND completed_at IS NOT NULL)
    )
);

-- 5. Activities table (コミュニティアクティビティ)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    completed_task_title TEXT CHECK (length(completed_task_title) <= 200),
    message TEXT CHECK (length(message) <= 2000),
    likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Likes table (いいね機能)
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Unique constraint: one user can like an activity only once
    UNIQUE(user_id, activity_id)
);

-- 7. User Follows table (フォロー機能)
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Prevent self-following
    CONSTRAINT check_no_self_follow CHECK (user_id != followed_user_id),
    -- Unique constraint: prevent duplicate follows
    UNIQUE(user_id, followed_user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_certification_id ON projects(certification_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_order_index ON tasks(project_id, order_index);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_likes_activity_id ON likes(activity_id);
CREATE INDEX idx_user_follows_user_id ON user_follows(user_id);
CREATE INDEX idx_user_follows_followed_user_id ON user_follows(followed_user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables that need it
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at
    BEFORE UPDATE ON certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();