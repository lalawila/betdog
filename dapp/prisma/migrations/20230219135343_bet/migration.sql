/*
  Warnings:

  - Added the required column `betId` to the `Gamble` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gamble" ADD COLUMN     "betId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Bet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiId" INTEGER NOT NULL,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bet_apiId_key" ON "Bet"("apiId");

-- AddForeignKey
ALTER TABLE "Gamble" ADD CONSTRAINT "Gamble_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
