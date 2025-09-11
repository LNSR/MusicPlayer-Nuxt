-- AlterTable
ALTER TABLE "public"."Session" ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "userAgent" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "updatedAt" DROP DEFAULT;
