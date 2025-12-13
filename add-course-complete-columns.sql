-- MIGRATION: Add Course Complete Feature Columns
-- Run this SQL in your Supabase SQL Editor if you have existing data

-- Add is_completed column
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

-- Add completed_at column
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Update existing rows to have is_completed as false
UPDATE courses SET is_completed = FALSE WHERE is_completed IS NULL;
