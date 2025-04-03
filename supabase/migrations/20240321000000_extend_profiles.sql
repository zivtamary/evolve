-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN widget_visibility JSONB NOT NULL DEFAULT '{
  "notes": true,
  "todoList": true,
  "pomodoro": false,
  "events": true
}'::jsonb,
ADD COLUMN cloud_sync_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN last_synced TIMESTAMP WITH TIME ZONE;

-- Create a function to update the last_synced timestamp
CREATE OR REPLACE FUNCTION update_last_synced()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_synced = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update last_synced
CREATE TRIGGER update_last_synced_trigger
BEFORE UPDATE OF cloud_sync_enabled ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_last_synced();

-- Update RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow service role to read and update all profiles
CREATE POLICY "Service role can read all profiles"
ON profiles FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update all profiles"
ON profiles FOR UPDATE
USING (auth.role() = 'service_role'); 