-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('PENDING', 'IN_NEGOTIATION', 'COUNTEROFFER', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CalculationTypeEnum" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "VerdictStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('AANMANING', 'SOMMATIE', 'INGEBREKESTELLING', 'BLOKKADE');

-- CreateEnum
CREATE TYPE "IdentificationType" AS ENUM ('DNI', 'PASSPORT', 'NIE', 'CIF', 'KVK', 'OTHER');

-- CreateEnum
CREATE TYPE "roleEnum" AS ENUM ('PLATFORM_OWNER', 'TENANT_ADMIN', 'AGENT', 'DEBTOR', 'BAILIFF');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TRANSFER', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "CollectionCaseStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateTable
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "kvk" TEXT,
    "legal_name" TEXT,
    "address" TEXT,
    "city" TEXT,
    "logo_url" TEXT,
    "number_of_employees" INTEGER,
    "phone" TEXT,
    "website" TEXT,
    "terms_accepted" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(80) NOT NULL,
    "password_hash" VARCHAR(120),
    "fullname" VARCHAR(80),
    "phone" VARCHAR(25),
    "tenant_id" TEXT NOT NULL,
    "role" "roleEnum" NOT NULL DEFAULT 'TENANT_ADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parameter" (
    "id" TEXT NOT NULL,
    "collection_fee_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "abb_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "company_aanmaning_term_days" INTEGER NOT NULL DEFAULT 0,
    "consumer_aanmaning_term_days" INTEGER NOT NULL DEFAULT 0,
    "company_sommatie_term_days" INTEGER NOT NULL DEFAULT 0,
    "consumer_sommatie_term_days" INTEGER NOT NULL DEFAULT 0,
    "small_company_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "small_company_pfc_contribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "large_company_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "large_company_pfc_contribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "company_aanmaning_penalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "natural_aanmaning_penalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "company_sommatie_penalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "natural_sommatie_penalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "company_reaction_limit_days" INTEGER NOT NULL DEFAULT 0,
    "company_no_reaction_penalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "natural_no_reaction_penalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "company_payment_agreement_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "natural_payment_agreement_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "invoice_number_length" INTEGER NOT NULL DEFAULT 8,
    "invoice_prefix" TEXT NOT NULL DEFAULT '',
    "invoice_sequence" INTEGER NOT NULL DEFAULT 0,
    "bank_account" TEXT NOT NULL DEFAULT '',
    "bank_name" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdict" (
    "id" TEXT NOT NULL,
    "invoice_number" VARCHAR(100) NOT NULL,
    "creditor_name" VARCHAR(100) NOT NULL,
    "debtor_id" TEXT NOT NULL,
    "registration_number" VARCHAR(100) NOT NULL,
    "sentence_amount" DOUBLE PRECISION NOT NULL,
    "sentence_date" TIMESTAMP(3) NOT NULL,
    "status" "VerdictStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "procesal_cost" DOUBLE PRECISION DEFAULT 0,
    "tenant_id" TEXT NOT NULL,
    "notes" TEXT,
    "bailiff_id" TEXT,

    CONSTRAINT "verdict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdict_interest" (
    "id" TEXT NOT NULL,
    "interest_type" INTEGER NOT NULL,
    "base_amount" DOUBLE PRECISION NOT NULL,
    "calculated_interest" DOUBLE PRECISION,
    "calculation_start" TIMESTAMP(3) NOT NULL,
    "calculation_end" TIMESTAMP(3) NOT NULL,
    "total_interest" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "verdict_id" TEXT,

    CONSTRAINT "verdict_interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdict_interest_details" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "annual_rate" DOUBLE PRECISION NOT NULL,
    "proportional_rate" DOUBLE PRECISION NOT NULL,
    "base_amount" DOUBLE PRECISION NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "verdict_interest_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verdict_interest_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdict_embargo" (
    "id" TEXT NOT NULL,
    "verdict_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_phone" TEXT NOT NULL,
    "company_email" TEXT NOT NULL,
    "company_address" TEXT NOT NULL,
    "embargo_type" TEXT NOT NULL,
    "embargo_date" TIMESTAMP(3) NOT NULL,
    "embargo_amount" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verdict_embargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdict_bailiff_services" (
    "id" TEXT NOT NULL,
    "verdict_id" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "service_cost" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verdict_bailiff_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdict_attachment" (
    "id" TEXT NOT NULL,
    "verdict_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "file_name" TEXT NOT NULL,

    CONSTRAINT "verdict_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "calculation_type" "CalculationTypeEnum" NOT NULL,

    CONSTRAINT "interest_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_detail" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "interest_type_id" INTEGER NOT NULL,

    CONSTRAINT "interest_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_invoice" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "issue_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'unpaid',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_invoice_detail" (
    "id" TEXT NOT NULL,
    "item_description" TEXT NOT NULL,
    "item_quantity" INTEGER NOT NULL,
    "item_unit_price" DOUBLE PRECISION NOT NULL,
    "item_total_price" DOUBLE PRECISION NOT NULL,
    "item_tax_rate" DOUBLE PRECISION NOT NULL,
    "item_tax_amount" DOUBLE PRECISION NOT NULL,
    "item_total_with_tax" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "billing_invoice_id" TEXT,

    CONSTRAINT "billing_invoice_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_payment" (
    "id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT NOT NULL,
    "transaction_id" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "billing_invoice_id" TEXT,

    CONSTRAINT "billing_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_case" (
    "id" TEXT NOT NULL,
    "reference_number" TEXT,
    "issue_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "reminder1_sent_at" TIMESTAMP(3),
    "reminder1_due_date" TIMESTAMP(3),
    "reminder2_sent_at" TIMESTAMP(3),
    "reminder2_due_date" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,
    "debtor_id" TEXT NOT NULL,
    "amount_original" DECIMAL(10,2) NOT NULL,
    "amount_due" DECIMAL(10,2) NOT NULL,
    "amount_to_receive" DECIMAL(10,2) NOT NULL,
    "status" "CollectionCaseStatus" NOT NULL DEFAULT 'PENDING',
    "notification_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_case_penalty" (
    "id" TEXT NOT NULL,
    "collection_case_id" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "date_applied" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_case_penalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_case_notification" (
    "id" TEXT NOT NULL,
    "collection_case_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_case_notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_case_payment" (
    "id" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "collection_case_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "reference_number" TEXT,
    "agreement_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_case_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debtor" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "person_type" "PersonType" NOT NULL DEFAULT 'INDIVIDUAL',
    "identification_type" "IdentificationType",
    "identification" TEXT,
    "total_income" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debtor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_room" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "collection_case_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "file_url" TEXT,
    "file_name" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debtor_incomes" (
    "id" TEXT NOT NULL,
    "debtor_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debtor_incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_case_agreement" (
    "id" TEXT NOT NULL,
    "collection_case_id" TEXT NOT NULL,
    "debtor_id" TEXT,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "installment_amount" DECIMAL(10,2) NOT NULL,
    "installments_count" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'PENDING',
    "tenant_id" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_case_agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_case_agreement_installment" (
    "id" TEXT NOT NULL,
    "agreement_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_case_agreement_installment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_subdomain_key" ON "tenant"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "billing_invoice_invoice_number_key" ON "billing_invoice"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "debtor_tenant_id_email_key" ON "debtor"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "debtor_tenant_id_identification_key" ON "debtor"("tenant_id", "identification");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict" ADD CONSTRAINT "verdict_bailiff_id_fkey" FOREIGN KEY ("bailiff_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict" ADD CONSTRAINT "verdict_debtor_id_fkey" FOREIGN KEY ("debtor_id") REFERENCES "debtor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict" ADD CONSTRAINT "verdict_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict_interest" ADD CONSTRAINT "verdict_interest_verdict_id_fkey" FOREIGN KEY ("verdict_id") REFERENCES "verdict"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict_interest_details" ADD CONSTRAINT "verdict_interest_details_verdict_interest_id_fkey" FOREIGN KEY ("verdict_interest_id") REFERENCES "verdict_interest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict_embargo" ADD CONSTRAINT "verdict_embargo_verdict_id_fkey" FOREIGN KEY ("verdict_id") REFERENCES "verdict"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict_bailiff_services" ADD CONSTRAINT "verdict_bailiff_services_verdict_id_fkey" FOREIGN KEY ("verdict_id") REFERENCES "verdict"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict_attachment" ADD CONSTRAINT "verdict_attachment_verdict_id_fkey" FOREIGN KEY ("verdict_id") REFERENCES "verdict"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_detail" ADD CONSTRAINT "interest_detail_interest_type_id_fkey" FOREIGN KEY ("interest_type_id") REFERENCES "interest_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoice_detail" ADD CONSTRAINT "billing_invoice_detail_billing_invoice_id_fkey" FOREIGN KEY ("billing_invoice_id") REFERENCES "billing_invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_payment" ADD CONSTRAINT "billing_payment_billing_invoice_id_fkey" FOREIGN KEY ("billing_invoice_id") REFERENCES "billing_invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case" ADD CONSTRAINT "collection_case_debtor_id_fkey" FOREIGN KEY ("debtor_id") REFERENCES "debtor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case" ADD CONSTRAINT "collection_case_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case_penalty" ADD CONSTRAINT "collection_case_penalty_collection_case_id_fkey" FOREIGN KEY ("collection_case_id") REFERENCES "collection_case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case_notification" ADD CONSTRAINT "collection_case_notification_collection_case_id_fkey" FOREIGN KEY ("collection_case_id") REFERENCES "collection_case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case_payment" ADD CONSTRAINT "collection_case_payment_collection_case_id_fkey" FOREIGN KEY ("collection_case_id") REFERENCES "collection_case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case_payment" ADD CONSTRAINT "collection_case_payment_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "collection_case_agreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debtor" ADD CONSTRAINT "debtor_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debtor" ADD CONSTRAINT "debtor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room" ADD CONSTRAINT "chat_room_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room" ADD CONSTRAINT "chat_room_collection_case_id_fkey" FOREIGN KEY ("collection_case_id") REFERENCES "collection_case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chat_room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debtor_incomes" ADD CONSTRAINT "debtor_incomes_debtor_id_fkey" FOREIGN KEY ("debtor_id") REFERENCES "debtor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case_agreement" ADD CONSTRAINT "collection_case_agreement_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case_agreement" ADD CONSTRAINT "collection_case_agreement_debtor_id_fkey" FOREIGN KEY ("debtor_id") REFERENCES "debtor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case_agreement" ADD CONSTRAINT "collection_case_agreement_collection_case_id_fkey" FOREIGN KEY ("collection_case_id") REFERENCES "collection_case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case_agreement_installment" ADD CONSTRAINT "collection_case_agreement_installment_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "collection_case_agreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case_agreement_installment" ADD CONSTRAINT "collection_case_agreement_installment_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "collection_case_payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
