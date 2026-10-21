CREATE TABLE events (
  id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         TEXT          NOT NULL,
  venue_id     INTEGER       NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  starts_at    TIMESTAMPTZ   NOT NULL,
  total_seats  INTEGER       NOT NULL CHECK (total_seats > 0),
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);
