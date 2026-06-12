-- ================================================
-- GK Network: Mijoz Mini App uchun jadvallar
-- Railway Console da ishlatish uchun
-- ================================================

-- 1. app_clients — Mini App foydalanuvchilari
CREATE TABLE IF NOT EXISTS app_clients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT NOT NULL,
  phone        TEXT NOT NULL,
  telegram_id  TEXT UNIQUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. app_applications — Arizalar
CREATE TABLE IF NOT EXISTS app_applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES app_clients(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('buy', 'rent', 'sell', 'rent_out')),
  message     TEXT DEFAULT '',
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexlar
CREATE INDEX IF NOT EXISTS idx_app_clients_phone ON app_clients(phone);
CREATE INDEX IF NOT EXISTS idx_app_clients_telegram ON app_clients(telegram_id);
CREATE INDEX IF NOT EXISTS idx_app_applications_client ON app_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_app_applications_property ON app_applications(property_id);
