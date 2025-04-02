# Supabase Sync Implementation Plan

## Database Schema

### Tables Required

1. **users**
```sql
-- This table is automatically created by Supabase Auth
```

2. **subscriptions**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'past_due')),
  plan_id VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

3. **payments**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(20) NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
  payment_method VARCHAR(50) NOT NULL,
  payment_intent_id VARCHAR(100),
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

4. **subscription_plans**
```sql
CREATE TABLE subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  interval VARCHAR(20) NOT NULL CHECK (interval IN ('month', 'year')),
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  USING (true);
```

5. **user_settings**
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_visibility JSONB DEFAULT '{"notes": true, "todoList": true, "pomodoro": true, "events": true}'::jsonb,
  theme VARCHAR(10) DEFAULT 'system',
  search_engine VARCHAR(20) DEFAULT 'google',
  clock_24h BOOLEAN DEFAULT false,
  sync_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

6. **todos**
```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Add RLS policies
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);
```

7. **notes**
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Add RLS policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);
```

8. **events**
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Add RLS policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);
```

9. **pomodoro_settings**
```sql
CREATE TABLE pomodoro_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE pomodoro_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pomodoro settings"
  ON pomodoro_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro settings"
  ON pomodoro_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro settings"
  ON pomodoro_settings FOR UPDATE
  USING (auth.uid() = user_id);
```

## Database Functions

### Subscription Status Check Function
```sql
CREATE OR REPLACE FUNCTION check_subscription_status()
RETURNS void AS $$
BEGIN
  -- Update expired subscriptions
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'active'
  AND current_period_end < NOW();

  -- Update past due subscriptions
  UPDATE subscriptions
  SET status = 'past_due'
  WHERE status = 'active'
  AND current_period_end < NOW() + INTERVAL '3 days';
END;
$$ LANGUAGE plpgsql;
```

### Cron Job Setup
```sql
-- Create a cron job to check subscription status daily
SELECT cron.schedule(
  'check-subscription-status',
  '0 0 * * *', -- Run at midnight every day
  $$
  SELECT check_subscription_status();
  $$
);
```

## Implementation Steps

1. **Database Setup**
   - Create all tables with their respective RLS policies
   - Set up the subscription status check function and cron job
   - Insert default subscription plans

2. **Backend Implementation**
   - Create subscription management endpoints
   - Implement payment processing
   - Add subscription status checks to sync functionality

3. **Frontend Implementation**
   - Add subscription management UI
   - Implement payment flow
   - Update sync functionality to check subscription status

4. **Testing**
   - Test subscription creation and management
   - Test payment processing
   - Test subscription expiration
   - Test sync functionality with subscription status

## Default Subscription Plans
```sql
INSERT INTO subscription_plans (id, name, description, price, interval, features)
VALUES
  ('free', 'Free', 'Basic features with limited sync', 0, 'month', '{"sync_enabled": false}'::jsonb),
  ('premium_monthly', 'Premium Monthly', 'Full access to all features', 4.99, 'month', '{"sync_enabled": true}'::jsonb),
  ('premium_yearly', 'Premium Yearly', 'Full access to all features with 2 months free', 49.99, 'year', '{"sync_enabled": true}'::jsonb);
```

## Additional Notes

1. **Subscription Status Flow**
   - New users start with a free plan
   - Users can upgrade to premium plans
   - Subscription status is checked daily
   - Expired subscriptions automatically revoke premium features

2. **Payment Processing**
   - Implement Stripe integration for payment processing
   - Store payment records in the payments table
   - Handle subscription cancellations and refunds

3. **Sync Access Control**
   - Only users with active premium subscriptions can sync data
   - Sync status is checked before any sync operation
   - Users are notified when their subscription expires

4. **Error Handling**
   - Handle failed payments gracefully
   - Provide clear error messages for subscription-related issues
   - Implement retry logic for failed sync operations 