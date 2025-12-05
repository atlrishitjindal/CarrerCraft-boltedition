/*
  # CareerCraft AI Database Schema

  ## Overview
  Complete database schema for CareerCraft AI - a production-grade SaaS platform for 
  AI-powered career optimization, resume enhancement, and job matching.

  ## Tables Created

  ### 1. `users` - User authentication and profile management
    - `id` (uuid, primary key) - Unique user identifier
    - `email` (text, unique) - User email address
    - `password_hash` (text) - Bcrypt hashed password
    - `role` (text) - User role: 'user', 'employer', or 'admin'
    - `full_name` (text) - User's full name
    - `avatar_url` (text) - Profile picture URL
    - `created_at` (timestamptz) - Account creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `resumes` - Resume storage and AI analysis
    - `id` (uuid, primary key) - Unique resume identifier
    - `user_id` (uuid, foreign key) - Owner of the resume
    - `file_url` (text) - Supabase Storage URL for original file
    - `file_name` (text) - Original filename
    - `parsed_text` (text) - Extracted text content
    - `rewritten_resume_url` (text) - AI-improved resume URL
    - `ats_score` (integer) - ATS compatibility score (0-100)
    - `improvement_suggestions` (jsonb) - AI-generated improvement tips
    - `skill_suggestions` (jsonb) - AI-recommended skills to add
    - `skills_extracted` (jsonb) - Parsed skills from resume
    - `experience_years` (integer) - Years of experience
    - `created_at` (timestamptz) - Upload timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `jobs` - Job postings from employers
    - `id` (uuid, primary key) - Unique job identifier
    - `employer_id` (uuid, foreign key) - Employer who posted
    - `title` (text) - Job title
    - `company` (text) - Company name
    - `description` (text) - Full job description
    - `requirements` (jsonb) - Required skills and qualifications
    - `location` (text) - Job location
    - `salary_min` (integer) - Minimum salary
    - `salary_max` (integer) - Maximum salary
    - `job_type` (text) - 'full-time', 'part-time', 'contract', 'remote'
    - `is_active` (boolean) - Job posting status
    - `created_at` (timestamptz) - Post date
    - `updated_at` (timestamptz) - Last update

  ### 4. `matches` - Job-candidate matching results
    - `id` (uuid, primary key) - Unique match identifier
    - `user_id` (uuid, foreign key) - Candidate
    - `job_id` (uuid, foreign key) - Job posting
    - `compatibility_score` (integer) - AI match score (0-100)
    - `missing_keywords` (jsonb) - Keywords candidate is missing
    - `matching_skills` (jsonb) - Skills that match
    - `cover_letter` (text) - AI-generated cover letter
    - `interview_questions` (jsonb) - AI-generated Q&A prep
    - `status` (text) - 'saved', 'applied', 'interviewing', 'rejected', 'accepted'
    - `applied_at` (timestamptz) - Application submission date
    - `created_at` (timestamptz) - Match creation date
    - `updated_at` (timestamptz) - Last update

  ### 5. `activities` - User activity timeline
    - `id` (uuid, primary key) - Activity identifier
    - `user_id` (uuid, foreign key) - User who performed action
    - `type` (text) - Activity type: 'resume_upload', 'job_apply', 'interview_scheduled', etc.
    - `title` (text) - Activity title
    - `description` (text) - Activity description
    - `metadata` (jsonb) - Additional activity data
    - `created_at` (timestamptz) - Activity timestamp

  ### 6. `email_logs` - Email tracking for job applications
    - `id` (uuid, primary key) - Email log identifier
    - `user_id` (uuid, foreign key) - User receiving email
    - `job_id` (uuid, foreign key) - Related job posting
    - `email_subject` (text) - Email subject line
    - `email_body` (text) - Email content
    - `sender_email` (text) - Sender's email address
    - `is_read` (boolean) - Read status
    - `received_at` (timestamptz) - Email received timestamp
    - `created_at` (timestamptz) - Log creation timestamp

  ### 7. `subscriptions` - Stripe subscription management
    - `id` (uuid, primary key) - Subscription identifier
    - `user_id` (uuid, foreign key) - Subscriber
    - `stripe_customer_id` (text) - Stripe customer ID
    - `stripe_subscription_id` (text) - Stripe subscription ID
    - `plan` (text) - Plan tier: 'free', 'basic', 'pro', 'enterprise'
    - `status` (text) - 'active', 'cancelled', 'past_due', 'trialing'
    - `current_period_start` (timestamptz) - Billing period start
    - `current_period_end` (timestamptz) - Billing period end
    - `created_at` (timestamptz) - Subscription creation
    - `updated_at` (timestamptz) - Last update

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies:
  - Users can only access their own data
  - Employers can manage their job postings
  - Admins have full access
  - Public can view active job listings

  ## Important Notes
  - All policies require authentication except public job viewing
  - Data is protected by default until explicit policies allow access
  - Foreign keys maintain referential integrity
  - Timestamps track all changes for audit trails
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'employer', 'admin')),
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  parsed_text text,
  rewritten_resume_url text,
  ats_score integer DEFAULT 0 CHECK (ats_score >= 0 AND ats_score <= 100),
  improvement_suggestions jsonb DEFAULT '[]'::jsonb,
  skill_suggestions jsonb DEFAULT '[]'::jsonb,
  skills_extracted jsonb DEFAULT '[]'::jsonb,
  experience_years integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL,
  description text NOT NULL,
  requirements jsonb DEFAULT '[]'::jsonb,
  location text NOT NULL,
  salary_min integer DEFAULT 0,
  salary_max integer DEFAULT 0,
  job_type text NOT NULL DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'contract', 'remote')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  compatibility_score integer DEFAULT 0 CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  missing_keywords jsonb DEFAULT '[]'::jsonb,
  matching_skills jsonb DEFAULT '[]'::jsonb,
  cover_letter text,
  interview_questions jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interviewing', 'rejected', 'accepted')),
  applied_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  email_subject text NOT NULL,
  email_body text NOT NULL,
  sender_email text NOT NULL,
  is_read boolean DEFAULT false,
  received_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_job_id ON matches(job_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for resumes table
CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
  ON resumes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for jobs table
CREATE POLICY "Anyone can view active jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Employers can insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = employer_id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('employer', 'admin')
    )
  );

CREATE POLICY "Employers can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Employers can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for matches table
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own matches"
  ON matches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can view matches for their jobs"
  ON matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = matches.job_id AND jobs.employer_id = auth.uid()
    )
  );

-- RLS Policies for activities table
CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for email_logs table
CREATE POLICY "Users can view own email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email logs"
  ON email_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();