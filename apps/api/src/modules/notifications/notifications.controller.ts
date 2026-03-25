import { Controller, Get, Post, Delete, Param, Body, Headers, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { OrgMemberGuard } from '../../common/guards/org-member.guard';
import { NotificationParamsDto } from './dto/notification-params.dto';
import { PushSubscriptionData } from '@issueflow/types';

@ApiTags('Notifications')
@ApiBearerAuth()
@ApiHeader({ name: 'x-org-id', required: true })
@UseGuards(OrgMemberGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushService: PushService
  ) {}

  @Post('push/subscribe')
  @ApiOperation({ summary: 'Subscribe to web push notifications' })
  async subscribePush(
    @CurrentUser() user: any,
    @Body() subscription: any, // We can type this with PushSubscriptionData in the future if we generate DTOs
  ) {
    return this.pushService.saveSubscription(user.id, subscription);
  }

  @Delete('push/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from web push notifications' })
  async unsubscribePush(
    @Body('endpoint') endpoint: string,
  ) {
    return this.pushService.removeSubscription(endpoint);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user notifications for the organization' })
  getMyNotifications(
    @CurrentUser() user: any,
    @Headers('x-org-id') orgId: string
  ) {
    return this.notificationsService.getMyNotifications(user.id, orgId);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(
    @Param() params: NotificationParamsDto,
    @CurrentUser() user: any
  ) {
    return this.notificationsService.markAsRead(params.id, user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for the organization' })
  markAllAsRead(
    @CurrentUser() user: any,
    @Headers('x-org-id') orgId: string
  ) {
    return this.notificationsService.markAllAsRead(user.id, orgId);
  }
}
