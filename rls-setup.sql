-- Row Level Security (RLS) Setup for CertPath
-- Ensures users can only access their own data and appropriate public data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- 1. USERS TABLE POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (auth_user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth_user_id = auth.uid());

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT
    WITH CHECK (auth_user_id = auth.uid());

-- Users can view public profiles (for community features)
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT
    USING (is_progress_public = true);

-- 2. CERTIFICATIONS TABLE POLICIES
-- Anyone can view active certifications (public data)
CREATE POLICY "Anyone can view active certifications" ON certifications
    FOR SELECT
    USING (is_active = true);

-- 3. PROJECTS TABLE POLICIES
-- Users can manage their own projects
CREATE POLICY "Users can manage own projects" ON projects
    FOR ALL
    USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Users can view public projects (for community features)
CREATE POLICY "Users can view public projects" ON projects
    FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM users 
            WHERE is_progress_public = true
        )
    );

-- 4. TASKS TABLE POLICIES
-- Users can manage their own tasks
CREATE POLICY "Users can manage own tasks" ON tasks
    FOR ALL
    USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Users can view public tasks (completed and public)
CREATE POLICY "Users can view public tasks" ON tasks
    FOR SELECT
    USING (
        is_public = true 
        AND is_completed = true
        AND user_id IN (
            SELECT id FROM users 
            WHERE is_progress_public = true
        )
    );

-- 5. ACTIVITIES TABLE POLICIES
-- Users can manage their own activities
CREATE POLICY "Users can manage own activities" ON activities
    FOR ALL
    USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Users can view activities from users with public progress
CREATE POLICY "Users can view public activities" ON activities
    FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM users 
            WHERE is_progress_public = true
        )
    );

-- 6. LIKES TABLE POLICIES
-- Users can manage their own likes
CREATE POLICY "Users can manage own likes" ON likes
    FOR ALL
    USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Users can view likes on public activities
CREATE POLICY "Users can view likes on public activities" ON likes
    FOR SELECT
    USING (
        activity_id IN (
            SELECT a.id FROM activities a
            JOIN users u ON a.user_id = u.id
            WHERE u.is_progress_public = true
        )
    );

-- 7. USER_FOLLOWS TABLE POLICIES
-- Users can manage their own follows
CREATE POLICY "Users can manage own follows" ON user_follows
    FOR ALL
    USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Users can view follows involving public users
CREATE POLICY "Users can view public follows" ON user_follows
    FOR SELECT
    USING (
        user_id IN (SELECT id FROM users WHERE is_progress_public = true)
        OR followed_user_id IN (SELECT id FROM users WHERE is_progress_public = true)
    );

-- Create helper function to get current user's ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM users WHERE auth_user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_user_id, display_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant read access to anonymous users for public data
GRANT SELECT ON certifications TO anon;

-- Create indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id_rls ON users(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_progress_public ON users(is_progress_public) WHERE is_progress_public = true;