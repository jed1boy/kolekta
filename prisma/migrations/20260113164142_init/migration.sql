-- CreateTable
CREATE TABLE "apiToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "apiToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "apiToken_token_key" ON "apiToken"("token");

-- CreateIndex
CREATE INDEX "apiToken_userId_idx" ON "apiToken"("userId");

-- CreateIndex
CREATE INDEX "apiToken_token_idx" ON "apiToken"("token");
