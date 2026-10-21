CREATE TABLE booking_seats (
  booking_id  INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id     INTEGER NOT NULL REFERENCES seats(id)    ON DELETE RESTRICT,
  PRIMARY KEY (booking_id, seat_id)
);

CREATE INDEX booking_seats_seat_id_idx ON booking_seats (seat_id);