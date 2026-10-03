-- Allow one optional co-buyer while keeping reservation emails private.
ALTER TABLE gifts ADD COLUMN claimed_with_email TEXT;
