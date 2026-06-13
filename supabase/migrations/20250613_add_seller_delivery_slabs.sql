CREATE TABLE IF NOT EXISTS seller_delivery_slabs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  min_distance_km NUMERIC NOT NULL DEFAULT 0,
  max_distance_km NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_delivery_slabs_seller_id ON seller_delivery_slabs(seller_id);

CREATE TABLE IF NOT EXISTS pincode_locations (
  pincode TEXT PRIMARY KEY,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  city TEXT,
  state TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE seller_delivery_slabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pincode_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_seller_delivery_slabs" ON seller_delivery_slabs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_pincode_locations" ON pincode_locations FOR ALL TO anon USING (true) WITH CHECK (true);
