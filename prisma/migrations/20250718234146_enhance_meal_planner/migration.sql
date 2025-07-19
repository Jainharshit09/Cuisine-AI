/*
  Warnings:

  - You are about to drop the column `recipes` on the `MealPlan` table. All the data in the column will be lost.
  - Added the required column `meals` to the `MealPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MealPlan" DROP COLUMN "recipes",
ADD COLUMN     "meals" JSONB NOT NULL;
