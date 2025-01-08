/*
  # Create Survey Response Table

  1. New Tables
    - `survey_responses`
      - `id` (uuid, primary key)
      - `consent` (text)
      - `age` (integer)
      - `gender` (text)
      - `job_title` (text)
      - `experience` (integer)
      - `career_satisfaction` (integer)
      - `self_awareness` (integer)
      - `self_management` (integer)
      - `social_awareness` (integer)
      - `relationship_management` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `survey_responses` table
    - Add policy for authenticated users to insert data
    - Add policy for authenticated users to read their own data
*/

CREATE TABLE survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent text NOT NULL,
  age integer,
  gender text,
  job_title text,
  experience integer,
  career_satisfaction integer,
  self_awareness integer,
  self_management integer,
  social_awareness integer,
  relationship_management integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert survey responses"
  ON survey_responses
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read responses"
  ON survey_responses
  FOR SELECT
  TO authenticated
  USING (true);