-- CreateEnum
CREATE TYPE "CalculationTypeEnum" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "VerdictStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('AANMANING', 'SOMMATIE', 'INGEBREKESTELLING', 'BLOKKADE');

-- CreateEnum
CREATE TYPE "IdentificationType" AS ENUM ('DNI', 'PASSPORT', 'NIE', 'CIF', 'KVK', 'OTHER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "roleEnum" AS ENUM ('ADMIN', 'MANAGER', 'ACCOUNTANT', 'BAILIFF', 'VIEWER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'CREDIT_CARD', 'CHECK', 'OTHER');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateTable
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "logoUrl" TEXT,
    "numberOfEmployees" INTEGER,
    "phone" TEXT,
    "website" TEXT,
    "planId" TEXT,
    "planStatus" TEXT NOT NULL DEFAULT 'pending',
    "planExpiresAt" TIMESTAMP(3),
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_registry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kvk" TEXT,
    "crib" TEXT,
    "taxId" TEXT,
    "vatNumber" TEXT,
    "legalName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_invitation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "invitedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "role" "roleEnum" NOT NULL DEFAULT 'VIEWER',

    CONSTRAINT "tenant_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(80) NOT NULL,
    "passwordHash" VARCHAR(120),
    "fullname" VARCHAR(80),
    "phone" VARCHAR(25),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "roleEnum" NOT NULL DEFAULT 'MANAGER',

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_parameters" (
    "id" TEXT NOT NULL,
    "porcCobranza" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "porcAbb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "diasPlazoEmpresaAanmaning" INTEGER NOT NULL DEFAULT 0,
    "diasPlazoConsumidorAanmaning" INTEGER NOT NULL DEFAULT 0,
    "diasPlazoEmpresaSommatie" INTEGER NOT NULL DEFAULT 0,
    "diasPlazoConsumidorSommatie" INTEGER NOT NULL DEFAULT 0,
    "precioEmpresaPequena" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contribucionEmpresaPequenaPfc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precioEmpresaGrande" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contribucionEmpresaGrandePfc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "multaAanmaningEmpresa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "multaAanmaningNatural" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "multaSommatieEmpresa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "multaSommatieNatural" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "limiteDiasReaccionEmpresa" INTEGER NOT NULL DEFAULT 0,
    "multaNoReaccionEmpresa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "multaNoReaccionNatural" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "multaAcuerdoPagoEmpresa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "multaAcuerdoPagoNatural" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "invoiceNumberLength" INTEGER NOT NULL DEFAULT 8,
    "invoicePrefix" TEXT NOT NULL DEFAULT '',
    "invoiceSecuence" INTEGER NOT NULL DEFAULT 0,
    "bankAccount" TEXT NOT NULL DEFAULT '',
    "bankName" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "global_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdict" (
    "id" TEXT NOT NULL,
    "invoiceNumber" VARCHAR(100) NOT NULL,
    "creditorName" VARCHAR(100) NOT NULL,
    "debtorId" TEXT NOT NULL,
    "registrationNumber" VARCHAR(100) NOT NULL,
    "sentenceAmount" DOUBLE PRECISION NOT NULL,
    "sentenceDate" TIMESTAMP(3) NOT NULL,
    "status" "VerdictStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "procesalCost" DOUBLE PRECISION DEFAULT 0,
    "tenantId" TEXT NOT NULL,
    "notes" TEXT,
    "bailiffId" TEXT,

    CONSTRAINT "verdict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdict_interest" (
    "id" TEXT NOT NULL,
    "interestType" INTEGER NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "calculatedInterest" DOUBLE PRECISION,
    "calculationStart" TIMESTAMP(3) NOT NULL,
    "calculationEnd" TIMESTAMP(3) NOT NULL,
    "totalInterest" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verdictId" TEXT,

    CONSTRAINT "verdict_interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdict_interest_details" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "annualRate" DOUBLE PRECISION NOT NULL,
    "proportionalRate" DOUBLE PRECISION NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "verdictInterestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verdict_interest_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdict_embargo" (
    "id" TEXT NOT NULL,
    "verdictId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyPhone" TEXT NOT NULL,
    "companyEmail" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "embargoType" TEXT NOT NULL,
    "embargoDate" TIMESTAMP(3) NOT NULL,
    "embargoAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verdict_embargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdict_bailiff_services" (
    "id" TEXT NOT NULL,
    "verdictId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "serviceCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verdict_bailiff_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdict_attachment" (
    "id" TEXT NOT NULL,
    "verdictId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT NOT NULL,

    CONSTRAINT "verdict_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "calculationType" "CalculationTypeEnum" NOT NULL,

    CONSTRAINT "interest_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_detail" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "interestTypeId" INTEGER NOT NULL,

    CONSTRAINT "interest_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_invoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'unpaid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_invoice_detail" (
    "id" TEXT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "itemQuantity" INTEGER NOT NULL,
    "itemUnitPrice" DOUBLE PRECISION NOT NULL,
    "itemTotalPrice" DOUBLE PRECISION NOT NULL,
    "itemTaxRate" DOUBLE PRECISION NOT NULL,
    "itemTaxAmount" DOUBLE PRECISION NOT NULL,
    "itemTotalWithTax" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "billingInvoiceId" TEXT,

    CONSTRAINT "billing_invoice_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_payment" (
    "id" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionId" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "billingInvoiceId" TEXT,

    CONSTRAINT "billing_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "durationDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_case" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "issueDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "tenantId" TEXT NOT NULL,
    "debtorId" TEXT NOT NULL,
    "amountOriginal" DECIMAL(10,2) NOT NULL,
    "amountDue" DECIMAL(10,2) NOT NULL,
    "amountToReceive" DECIMAL(10,2) NOT NULL,
    "status" "CollectionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penalty" (
    "id" TEXT NOT NULL,
    "collectionCaseId" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "dateApplied" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "collectionCaseId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collectionCaseId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "referenceNumber" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_agreement" (
    "id" TEXT NOT NULL,
    "debtorId" TEXT,
    "agreementDate" TIMESTAMP(3) NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "collectionCaseId" TEXT NOT NULL,
    "installmentAmount" DECIMAL(10,2),
    "nextPaymentDate" TIMESTAMP(3),
    "notes" TEXT,
    "totalInstallments" INTEGER,

    CONSTRAINT "payment_agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debtor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "personType" TEXT,
    "identificationType" "IdentificationType",
    "identification" TEXT,
    "totalIncome" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debtor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debtor_incomes" (
    "id" TEXT NOT NULL,
    "debtorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debtor_incomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_subdomain_key" ON "tenant"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_registry_tenantId_key" ON "tenant_registry"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_userId_tenantId_key" ON "memberships"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_invoice_invoiceNumber_key" ON "billing_invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "debtor_tenantId_email_key" ON "debtor"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "debtor_tenantId_identification_key" ON "debtor"("tenantId", "identification");

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_registry" ADD CONSTRAINT "tenant_registry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_invitation" ADD CONSTRAINT "tenant_invitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_invitation" ADD CONSTRAINT "tenant_invitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict" ADD CONSTRAINT "verdict_bailiffId_fkey" FOREIGN KEY ("bailiffId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict" ADD CONSTRAINT "verdict_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES "debtor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict" ADD CONSTRAINT "verdict_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict_interest" ADD CONSTRAINT "verdict_interest_verdictId_fkey" FOREIGN KEY ("verdictId") REFERENCES "verdict"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict_interest_details" ADD CONSTRAINT "verdict_interest_details_verdictInterestId_fkey" FOREIGN KEY ("verdictInterestId") REFERENCES "verdict_interest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict_embargo" ADD CONSTRAINT "verdict_embargo_verdictId_fkey" FOREIGN KEY ("verdictId") REFERENCES "verdict"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict_bailiff_services" ADD CONSTRAINT "verdict_bailiff_services_verdictId_fkey" FOREIGN KEY ("verdictId") REFERENCES "verdict"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdict_attachment" ADD CONSTRAINT "verdict_attachment_verdictId_fkey" FOREIGN KEY ("verdictId") REFERENCES "verdict"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_detail" ADD CONSTRAINT "interest_detail_interestTypeId_fkey" FOREIGN KEY ("interestTypeId") REFERENCES "interest_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoice_detail" ADD CONSTRAINT "billing_invoice_detail_billingInvoiceId_fkey" FOREIGN KEY ("billingInvoiceId") REFERENCES "billing_invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_payment" ADD CONSTRAINT "billing_payment_billingInvoiceId_fkey" FOREIGN KEY ("billingInvoiceId") REFERENCES "billing_invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case" ADD CONSTRAINT "collection_case_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES "debtor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_case" ADD CONSTRAINT "collection_case_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalty" ADD CONSTRAINT "penalty_collectionCaseId_fkey" FOREIGN KEY ("collectionCaseId") REFERENCES "collection_case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_collectionCaseId_fkey" FOREIGN KEY ("collectionCaseId") REFERENCES "collection_case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_collectionCaseId_fkey" FOREIGN KEY ("collectionCaseId") REFERENCES "collection_case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_agreement" ADD CONSTRAINT "payment_agreement_collectionCaseId_fkey" FOREIGN KEY ("collectionCaseId") REFERENCES "collection_case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_agreement" ADD CONSTRAINT "payment_agreement_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES "debtor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debtor" ADD CONSTRAINT "debtor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debtor" ADD CONSTRAINT "debtor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debtor_incomes" ADD CONSTRAINT "debtor_incomes_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES "debtor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
