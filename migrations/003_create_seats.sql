CREATE TABLE seats (
  id           INTEGER     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id     INTEGER     NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  seat_number  INTEGER     NOT NULL CHECK (seat_number > 0),
  status       TEXT        NOT NULL DEFAULT 'available'
                           CHECK (status IN ('available', 'held', 'booked')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, seat_number)
);
