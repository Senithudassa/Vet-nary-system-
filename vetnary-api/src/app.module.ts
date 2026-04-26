import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClinicsModule } from './clinics/clinics.module';
import { PetsModule } from './pets/pets.module';
import { VetbookModule } from './vetbook/vetbook.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ClinicsModule,
    PetsModule,
    VetbookModule,
    AppointmentsModule,
    InvoicesModule,
    AdminModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
