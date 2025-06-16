-- InputPlan neue Felder hinzufügen
ALTER TABLE "InputPlan" 
ADD COLUMN IF NOT EXISTS "implementationLevel" TEXT,
ADD COLUMN IF NOT EXISTS "creativeFormat" TEXT,
ADD COLUMN IF NOT EXISTS "creativeBriefingExample" TEXT,
ADD COLUMN IF NOT EXISTS "copyExample" TEXT,
ADD COLUMN IF NOT EXISTS "copyExampleCustomized" TEXT,
ADD COLUMN IF NOT EXISTS "firstCommentForEngagement" TEXT,
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "action" TEXT;

-- ContentPlan neue Felder hinzufügen
ALTER TABLE "ContentPlan"
ADD COLUMN IF NOT EXISTS "implementationLevel" TEXT,
ADD COLUMN IF NOT EXISTS "creativeFormat" TEXT,
ADD COLUMN IF NOT EXISTS "creativeBriefingExample" TEXT,
ADD COLUMN IF NOT EXISTS "copyExample" TEXT,
ADD COLUMN IF NOT EXISTS "copyExampleCustomized" TEXT,
ADD COLUMN IF NOT EXISTS "firstCommentForEngagement" TEXT,
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "action" TEXT;

-- Prüfe die Struktur
\d "InputPlan"
\d "ContentPlan"
