-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityAction" ADD VALUE 'MEMBER_ROLE_UPDATED';
ALTER TYPE "ActivityAction" ADD VALUE 'MEMBER_REMOVED';
ALTER TYPE "ActivityAction" ADD VALUE 'PROJECT_UPDATED';
ALTER TYPE "ActivityAction" ADD VALUE 'PROJECT_DELETED';
ALTER TYPE "ActivityAction" ADD VALUE 'OWNERSHIP_TRANSFERRED';
ALTER TYPE "ActivityAction" ADD VALUE 'ORG_UPDATED';
