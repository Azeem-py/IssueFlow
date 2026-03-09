import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: Partial<Project>, ownerId: string): Promise<Project> {
    const project = this.projectsRepository.create({ ...createProjectDto, ownerId });
    return this.projectsRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({ relations: ['owner'] });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id }, relations: ['owner'] });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, updateData: Partial<Project>): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, updateData);
    return this.projectsRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectsRepository.remove(project);
  }
}
