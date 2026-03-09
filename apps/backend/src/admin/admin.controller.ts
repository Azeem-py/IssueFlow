import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, UserStatus } from '../entities/user.entity';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private usersService: UsersService) {}

  @Patch('users/:id/suspend')
  async suspendUser(@Param('id') id: string) {
    return this.usersService.updateStatus(id, UserStatus.SUSPENDED);
  }

  @Patch('users/:id/activate')
  async activateUser(@Param('id') id: string) {
    return this.usersService.updateStatus(id, UserStatus.ACTIVE);
  }
}
