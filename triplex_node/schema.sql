CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    
    token_version INTEGER DEFAULT 0 NOT NULL,     -- This is the key security field
    last_password_change TIMESTAMPTZ DEFAULT NOW(),
    
    name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(50) DEFAULT 'user',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    username VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cloud_url TEXT NOT NULL,
    public_id TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_cost NUMERIC(12, 2),
    total_cost_currency CHAR(3),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
    CREATE TYPE stop_role AS ENUM ('start', 'waypoint', 'end');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS trip_plan_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_plan_id UUID NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    role stop_role NOT NULL DEFAULT 'waypoint',
    location VARCHAR(255),
    place_id VARCHAR(255),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    description TEXT,
    cost NUMERIC(12, 2),
    currency CHAR(3),
    sort_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_plan_stops_plan_id ON trip_plan_stops(trip_plan_id);
CREATE INDEX IF NOT EXISTS idx_trip_plan_stops_sort ON trip_plan_stops(trip_plan_id, sort_order);

CREATE OR REPLACE FUNCTION sync_trip_plan_total_cost()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_trip_plan_id      UUID;
    v_currency_count    INT;
    v_currency          CHAR(3);
    v_total             NUMERIC(12, 2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_trip_plan_id := OLD.trip_plan_id;
    ELSE
        v_trip_plan_id := NEW.trip_plan_id;
    END IF;

    SELECT
        COUNT(DISTINCT currency),
        MIN(currency)
    INTO v_currency_count, v_currency
    FROM trip_plan_stops
    WHERE trip_plan_id = v_trip_plan_id
      AND cost IS NOT NULL;

    IF v_currency_count = 1 THEN
        SELECT COALESCE(SUM(cost), 0)
        INTO v_total
        FROM trip_plan_stops
        WHERE trip_plan_id = v_trip_plan_id
          AND cost IS NOT NULL;

        UPDATE trip_plans
        SET
            total_cost          = v_total,
            total_cost_currency = v_currency
        WHERE id = v_trip_plan_id;
    ELSE
        UPDATE trip_plans
        SET total_cost = NULL
        WHERE id = v_trip_plan_id;
    END IF; 

    RETURN NULL;
END;
$$;

-- Trigger 
DROP TRIGGER IF EXISTS trg_sync_total_cost ON trip_plan_stops;
CREATE TRIGGER trg_sync_total_cost
    AFTER INSERT OR DELETE OR UPDATE OF cost, currency
    ON trip_plan_stops
    FOR EACH ROW
    EXECUTE FUNCTION sync_trip_plan_total_cost();