import { Module } from '@nestjs/common';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { IssueSequenceService } from './issue-sequence.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [IssuesController],
  providers: [IssuesService, IssueSequenceService],
  exports: [IssuesService],
})
export class IssuesModule {}
