import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('comments')
@Controller('comments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  create(@Body() createCommentDto: any, @Req() req: any) {
    if (!createCommentDto.issueId) {
      throw new BadRequestException('issueId is required');
    }
    return this.commentsService.create(createCommentDto, req.user.id, createCommentDto.issueId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments for an issue' })
  findAll(@Query('issueId') issueId: string) {
    if (!issueId) {
      throw new BadRequestException('issueId query parameter is required');
    }
    return this.commentsService.findAll(issueId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by id' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  update(@Param('id') id: string, @Body() updateCommentDto: any) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
