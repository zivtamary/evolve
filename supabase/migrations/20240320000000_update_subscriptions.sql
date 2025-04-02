-- Drop existing subscriptions table
DROP TABLE IF EXISTS subscriptions;

-- Create subscriptions table with Polar fields
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY, -- Polar subscription ID
    user_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert/update
CREATE POLICY "Service role can manage subscriptions"
    ON subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy to allow users to read their own subscriptions
CREATE POLICY "Users can read their own subscriptions"
    ON subscriptions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Create function to update modified_at timestamp
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at_column(); 