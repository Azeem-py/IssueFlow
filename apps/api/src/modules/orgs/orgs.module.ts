import { Module } from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { OrgsController } from './orgs.controller';
import { InvitesService } from './invites.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  providers: [OrgsService, InvitesService],
  controllers: [OrgsController],
  exports: [OrgsService],
})
export class OrgsModule {}
