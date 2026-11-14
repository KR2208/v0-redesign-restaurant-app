-- CreateTable
CREATE TABLE "CachedSearch" (
    "key" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedSearch_pkey" PRIMARY KEY ("key")
);
