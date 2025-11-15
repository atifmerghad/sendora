-- CreateTable
CREATE TABLE "cities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "zoneId" INTEGER,
    "ville" TEXT NOT NULL,
    "name" TEXT,
    "arabicName" TEXT,
    "price" REAL NOT NULL,
    "delais" TEXT,
    "region" TEXT,
    "refusedCost" REAL NOT NULL DEFAULT 0,
    "canceledCost" REAL NOT NULL DEFAULT 0,
    "priceDriver" REAL,
    "refusedCostDriver" REAL NOT NULL DEFAULT 0,
    "active" TEXT,
    "driverId" TEXT,
    "pickerId" TEXT,
    "note" TEXT,
    "comment" TEXT,
    "pickupDistrict" TEXT,
    "minPickup" INTEGER NOT NULL DEFAULT 0,
    "feePickup" REAL NOT NULL DEFAULT 0,
    "feePickupDriver" REAL NOT NULL DEFAULT 0,
    "minPickupRequired" INTEGER NOT NULL DEFAULT 0,
    "pickupEndTime" TEXT,
    "allowNewDestination" TEXT,
    "deliveryDays" TEXT,
    "createdAt" TEXT,
    "updatedAt" DATETIME,
    "deletedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "cities_ville_idx" ON "cities"("ville");

-- CreateIndex
CREATE INDEX "cities_region_idx" ON "cities"("region");

-- CreateIndex
CREATE INDEX "cities_active_idx" ON "cities"("active");
