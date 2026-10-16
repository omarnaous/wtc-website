-- Booking times: 10:00 to 17:00 (was 10:00 to 18:00).
UPDATE settings SET value = '["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]' WHERE key = 'booking_slots';
