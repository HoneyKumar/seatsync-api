CREATE TABLE bookings (
  id            INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id   INTEGER       NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  event_id      INTEGER       NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  status        TEXT          NOT NULL DEFAULT 'confirmed'
                              CHECK (status IN ('confirmed', 'cancelled')),
  total_amount  NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX bookings_customer_id_idx ON bookings (customer_id);
CREATE INDEX bookings_event_id_idx ON bookings (event_id);
