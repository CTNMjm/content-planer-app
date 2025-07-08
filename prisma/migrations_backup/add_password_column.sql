-- Füge password Spalte zur User Tabelle hinzu
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Setze ein Default-Passwort für existierende User (admin123 gehashed)
UPDATE "User" 
SET "password" = '$2a$10$DJk03IntjCaiqCn3QTCGJuTFI8UNTvnGiQ/w9/620ziMlnwRo9l6i'
WHERE "password" IS NULL;

-- Mache password NOT NULL
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;