import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('issues')
@Controller('issues')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class IssuesController {
  constructor(
    private readonly issuesService: IssuesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new issue' })
  @UseInterceptors(FileInterceptor('attachment'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        projectId: { type: 'string' },
        type: { type: 'string', enum: ['bug', 'feature'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        attachment: { type: 'string', format: 'binary', nullable: true },
      },
    },
  })
  async create(
    @Body() createIssueDto: any,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!createIssueDto.projectId) {
      throw new BadRequestException('projectId is required');
    }

    let attachments = [];
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      attachments.push(uploadResult.secure_url);
    }

    return this.issuesService.create(
      { ...createIssueDto, attachments },
      req.user.id,
      createIssueDto.projectId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all issues for a project' })
  findAll(@Query('projectId') projectId: string) {
    if (!projectId) {
      throw new BadRequestException('projectId query parameter is required');
    }
    return this.issuesService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an issue by id' })
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an issue' })
  update(@Param('id') id: string, @Body() updateIssueDto: any) {
    return this.issuesService.update(id, updateIssueDto);
  }

  @Patch(':id/upvote')
  @ApiOperation({ summary: 'Upvote an issue' })
  upvote(@Param('id') id: string) {
    return this.issuesService.upvote(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an issue' })
  remove(@Param('id') id: string) {
    return this.issuesService.remove(id);
  }
}
