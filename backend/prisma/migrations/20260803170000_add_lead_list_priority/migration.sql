ALTER TABLE "Lead" ADD COLUMN "listPriority" INTEGER NOT NULL DEFAULT 0;

UPDATE "Lead"
SET "listPriority" = CASE
  WHEN "status" = 'No Requirement' THEN 999999
  ELSE 0
END;
