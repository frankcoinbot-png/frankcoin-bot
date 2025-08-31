-- Users & balances
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  tg_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMP DEFAULT now(),
  referrer_id BIGINT
);

CREATE TABLE IF NOT EXISTS balances (
  user_id BIGINT REFERENCES users(tg_id) ON DELETE CASCADE,
  coins BIGINT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  user_id BIGINT REFERENCES users(tg_id) ON DELETE CASCADE,
  referred_id BIGINT UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Subscriptions (Premium)
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(tg_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL DEFAULT (now() + interval '30 days'),
  auto_click_available BOOLEAN DEFAULT true
);

-- TON transactions (purchases / payouts)
CREATE TABLE IF NOT EXISTS ton_transactions (
  id SERIAL PRIMARY KEY,
  tx_hash TEXT UNIQUE,
  user_id BIGINT DEFAULT 0,
  amount_ton NUMERIC(18,6) NOT NULL,
  payload TEXT,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Tap logs (optional aggregation)
CREATE TABLE IF NOT EXISTS taps (
  id SERIAL PRIMARY KEY,
  user_id BIGINT,
  amount INT,
  created_at TIMESTAMP DEFAULT now()
);

-- Leaderboard materialized view simplified (recreate as needed)
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard AS
SELECT u.tg_id, u.username, b.coins AS score
FROM users u
LEFT JOIN balances b ON b.user_id = u.tg_id
ORDER BY b.coins DESC NULLS LAST;

-- Helper upsert functions
CREATE OR REPLACE FUNCTION ensure_user(p_tg_id BIGINT, p_username TEXT DEFAULT NULL, p_referrer BIGINT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO users (tg_id, username, referrer_id)
  VALUES (p_tg_id, p_username, p_referrer)
  ON CONFLICT (tg_id) DO UPDATE SET username = EXCLUDED.username;
  INSERT INTO balances (user_id, coins) VALUES (p_tg_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
END; $$ LANGUAGE plpgsql;

