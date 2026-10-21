ALTER TABLE booking_seats ADD COLUMN released_at TIMESTAMPTZ;

CREATE UNIQUE INDEX booking_seats_active_seat_uidx
  ON booking_seats (seat_id)
  WHERE released_at IS NULL;