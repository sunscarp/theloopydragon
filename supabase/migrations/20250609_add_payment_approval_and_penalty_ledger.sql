ALTER TABLE "Your Profile" ADD COLUMN IF NOT EXISTS payment_approval_status TEXT DEFAULT 'approval_needed';

CREATE TABLE IF NOT EXISTS penalty_ledger (
  id SERIAL PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id),
  order_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
