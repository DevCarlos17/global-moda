CREATE TABLE public.containers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_number TEXT NOT NULL UNIQUE,
  supplier        TEXT NOT NULL,
  origin_country  TEXT NOT NULL,
  order_date      DATE NOT NULL,
  etd             DATE,
  eta             DATE,
  actual_arrival  DATE,
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','ordered','in_transit','in_customs','arrived','cancelled')),
  notes           TEXT,
  total_cost      NUMERIC(12,2) DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX containers_status_idx ON public.containers(status);

ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gestiona containers"
  ON public.containers FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE TRIGGER containers_updated_at
  BEFORE UPDATE ON public.containers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
