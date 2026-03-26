import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ActivityController } from './activity.controller';

@Module({
  providers: [DashboardService],
  controllers: [DashboardController, ActivityController]
})
export class DashboardModule {}
