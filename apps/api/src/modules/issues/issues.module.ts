import { Module } from '@nestjs/common';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { IssueSequenceService } from './issue-sequence.service';

@Module({
  controllers: [IssuesController],
  providers: [IssuesService, IssueSequenceService],
  exports: [IssuesService],
})
export class IssuesModule {}
