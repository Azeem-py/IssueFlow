import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: Partial<Comment>, userId: string, issueId: string): Promise<Comment> {
    const comment = this.commentsRepository.create({ ...createCommentDto, userId, issueId });
    return this.commentsRepository.save(comment);
  }

  async findAll(issueId: string): Promise<Comment[]> {
    return this.commentsRepository.find({ where: { issueId }, relations: ['user'] });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({ where: { id }, relations: ['user', 'issue'] });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async update(id: string, updateData: Partial<Comment>): Promise<Comment> {
    const comment = await this.findOne(id);
    Object.assign(comment, updateData);
    return this.commentsRepository.save(comment);
  }

  async remove(id: string): Promise<void> {
    const comment = await this.findOne(id);
    await this.commentsRepository.remove(comment);
  }
}
