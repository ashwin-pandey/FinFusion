-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('PERSONAL', 'HOME', 'CAR', 'EDUCATION', 'BUSINESS', 'CREDIT_CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'PAID_OFF', 'DEFAULTED', 'REFINANCED', 'PAUSED');

-- CreateEnum
CREATE TYPE "PrePaymentType" AS ENUM ('PARTIAL', 'FULL', 'EMILY_ONLY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'DEFAULTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "is_essential" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LoanType" NOT NULL,
    "original_principal" DECIMAL(65,30) NOT NULL,
    "original_interest_rate" DECIMAL(65,30) NOT NULL,
    "original_term_months" INTEGER NOT NULL,
    "original_start_date" TIMESTAMP(3) NOT NULL,
    "current_balance" DECIMAL(65,30) NOT NULL,
    "current_interest_rate" DECIMAL(65,30),
    "remaining_term_months" INTEGER,
    "account_id" TEXT NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "total_paid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_interest_paid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_pre_payments" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_interest_savings" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "last_payment_date" TIMESTAMP(3),
    "next_payment_date" TIMESTAMP(3),
    "is_existing_loan" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_payments" (
    "id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "principal_amount" DECIMAL(65,30) NOT NULL,
    "interest_amount" DECIMAL(65,30) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "transaction_id" TEXT,
    "is_pre_payment" BOOLEAN NOT NULL DEFAULT false,
    "pre_payment_type" "PrePaymentType",
    "interest_savings" DECIMAL(65,30),
    "term_reduction" INTEGER,
    "is_scheduled" BOOLEAN NOT NULL DEFAULT false,
    "scheduled_date" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "default_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loan_payments_transaction_id_key" ON "loan_payments"("transaction_id");

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_payments" ADD CONSTRAINT "loan_payments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_payments" ADD CONSTRAINT "loan_payments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
