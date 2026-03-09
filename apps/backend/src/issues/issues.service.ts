import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue, IssueStatus } from '../entities/issue.entity';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private issuesRepository: Repository<Issue>,
  ) {}

  async create(createIssueDto: Partial<Issue>, reporterId: string, projectId: string): Promise<Issue> {
    const issue = this.issuesRepository.create({ ...createIssueDto, reporterId, projectId });
    return this.issuesRepository.save(issue);
  }

  async findAll(projectId: string): Promise<Issue[]> {
    return this.issuesRepository.find({ where: { projectId }, relations: ['reporter'] });
  }

  async findOne(id: string): Promise<Issue> {
    const issue = await this.issuesRepository.findOne({ where: { id }, relations: ['reporter', 'project'] });
    if (!issue) throw new NotFoundException('Issue not found');
    return issue;
  }

  async update(id: string, updateData: Partial<Issue>): Promise<Issue> {
    const issue = await this.findOne(id);
    Object.assign(issue, updateData);
    return this.issuesRepository.save(issue);
  }

  async remove(id: string): Promise<void> {
    const issue = await this.findOne(id);
    await this.issuesRepository.remove(issue);
  }

  async upvote(id: string): Promise<Issue> {
    const issue = await this.findOne(id);
    issue.upvotes += 1;
    return this.issuesRepository.save(issue);
  }
}
