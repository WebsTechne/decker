-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
