/*
  # Initial Schema Setup for IdeaForge

  1. New Tables
    - users (handled by Supabase Auth)
    - projects
      - id (uuid, primary key)
      - user_id (references auth.users)
      - title (text)
      - need (text)
      - current_solution (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    - categories
      - id (uuid, primary key)
      - name (text)
    - project_categories
      - project_id (references projects)
      - category_id (references categories)
    - ideas
      - id (uuid, primary key)
      - project_id (references projects)
      - content (text)
      - heuristic (text)
      - rating (integer)
      - created_at (timestamp)
    - comments
      - id (uuid, primary key)
      - idea_id (references ideas)
      - user_id (references auth.users)
      - content (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  need text NOT NULL,
  current_solution text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);

-- Create project_categories junction table
CREATE TABLE project_categories (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);

-- Create ideas table
CREATE TABLE ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  heuristic text NOT NULL,
  rating integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Categories are readable by all authenticated users
CREATE POLICY "Categories are readable by authenticated users"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Project categories inherit project permissions
CREATE POLICY "Project categories inherit project permissions"
  ON project_categories FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_categories.project_id
    AND projects.user_id = auth.uid()
  ));

-- Ideas inherit project permissions
CREATE POLICY "Ideas inherit project permissions"
  ON ideas FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = ideas.project_id
    AND projects.user_id = auth.uid()
  ));

-- Comments are readable by project owners
CREATE POLICY "Comments are readable by project owners"
  ON comments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM ideas
    JOIN projects ON ideas.project_id = projects.id
    WHERE ideas.id = comments.idea_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create comments on accessible ideas"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM ideas
      JOIN projects ON ideas.project_id = projects.id
      WHERE ideas.id = idea_id
      AND projects.user_id = auth.uid()
    )
  );

-- Insert default categories
INSERT INTO categories (name) VALUES
  ('Technology'),
  ('Product Design'),
  ('Service Innovation'),
  ('Business Model'),
  ('User Experience'),
  ('Sustainability'),
  ('Healthcare'),
  ('Education'),
  ('Entertainment'),
  ('Transportation');