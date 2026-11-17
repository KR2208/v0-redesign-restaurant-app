-- CreateTable
CREATE TABLE "NearbyOutingCache" (
    "placeId" TEXT NOT NULL,
    "plan" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NearbyOutingCache_pkey" PRIMARY KEY ("placeId")
);
