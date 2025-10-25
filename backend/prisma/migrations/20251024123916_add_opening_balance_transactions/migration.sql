/*
  Warnings:

  - You are about to drop the column `payment_method` on the `transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'OPENING_BALANCE';

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "payment_method",
ADD COLUMN     "is_opening_balance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payment_method_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "username" TEXT;

-- DropEnum
DROP TYPE "PaymentMethod";

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_code_key" ON "payment_methods"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
