-- AlterTable
ALTER TABLE "prescriptions" ADD COLUMN     "appointmentId" TEXT;

-- AlterTable
ALTER TABLE "support_tickets" ADD COLUMN     "assignedAdminId" TEXT,
ADD COLUMN     "assignedVetId" TEXT;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignedVetId_fkey" FOREIGN KEY ("assignedVetId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
