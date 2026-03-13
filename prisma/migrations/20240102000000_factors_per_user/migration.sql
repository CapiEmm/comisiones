-- Drop old unique constraint on porcentaje alone
DROP INDEX IF EXISTS "commission_factors_porcentaje_key";

-- Add user_id column (nullable first to handle existing rows)
ALTER TABLE "commission_factors" ADD COLUMN "user_id" TEXT;

-- Delete all existing global factors (seed will recreate them per user)
DELETE FROM "commission_factors";

-- Now make user_id NOT NULL
ALTER TABLE "commission_factors" ALTER COLUMN "user_id" SET NOT NULL;

-- Add foreign key
ALTER TABLE "commission_factors"
  ADD CONSTRAINT "commission_factors_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add new unique constraint (user_id + porcentaje)
CREATE UNIQUE INDEX "commission_factors_user_id_porcentaje_key"
  ON "commission_factors"("user_id", "porcentaje");
