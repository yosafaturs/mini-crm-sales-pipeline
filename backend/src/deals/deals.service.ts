import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto, UpdateDealDto, UpdateDealStageDto, AssignDealDto } from './dto/deal.dto';
import { Role, DealStage } from '@prisma/client';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class DealsService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
  ) {}

  async findAll(user: { id: string; role: Role }) {
    const whereCondition =
      user.role === Role.ADMIN_MANAGER
        ? {}
        : { assignedUserId: user.id };

    return this.prisma.deal.findMany({
      where: whereCondition,
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { interactions: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, user: { id: string; role: Role }) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        interactions: {
          include: { createdBy: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    if (user.role !== Role.ADMIN_MANAGER && deal.assignedUserId !== user.id) {
      throw new ForbiddenException('You do not have permission to view this deal');
    }

    return deal;
  }

  async create(dto: CreateDealDto, user: { id: string; role: Role }) {
    const assignedUserId =
      user.role === Role.ADMIN_MANAGER && dto.assignedUserId
        ? dto.assignedUserId
        : user.id;

    const deal = await this.prisma.deal.create({
      data: {
        title: dto.title,
        description: dto.description,
        value: dto.value,
        stage: dto.stage || DealStage.LEAD_ACQUIRED,
        assignedUserId,
        createdById: user.id,
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    this.socketGateway.notifyDealUpdated(deal);
    return deal;
  }

  async updateStage(id: string, dto: UpdateDealStageDto, user: { id: string; role: Role }) {
    const existing = await this.prisma.deal.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    if (user.role !== Role.ADMIN_MANAGER && existing.assignedUserId !== user.id) {
      throw new ForbiddenException('You do not have permission to modify this deal');
    }

    const updated = await this.prisma.deal.update({
      where: { id },
      data: { stage: dto.stage },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    this.socketGateway.notifyDealUpdated(updated);
    return updated;
  }

  async update(id: string, dto: UpdateDealDto, user: { id: string; role: Role }) {
    const existing = await this.prisma.deal.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    if (user.role !== Role.ADMIN_MANAGER && existing.assignedUserId !== user.id) {
      throw new ForbiddenException('You do not have permission to modify this deal');
    }

    // Only Admin Manager can reassign deal
    let assignedUserId = existing.assignedUserId;
    if (dto.assignedUserId !== undefined) {
      if (user.role === Role.ADMIN_MANAGER) {
        assignedUserId = dto.assignedUserId;
      } else {
        throw new ForbiddenException('Only ADMIN_MANAGER can re-assign deal ownership');
      }
    }

    const updated = await this.prisma.deal.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        value: dto.value ?? existing.value,
        stage: dto.stage ?? existing.stage,
        assignedUserId,
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    this.socketGateway.notifyDealUpdated(updated);
    return updated;
  }

  async assign(id: string, dto: AssignDealDto) {
    const deal = await this.prisma.deal.update({
      where: { id },
      data: { assignedUserId: dto.assignedUserId },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    this.socketGateway.notifyDealUpdated(deal);
    return deal;
  }

  async getStageMetrics(user: { id: string; role: Role }) {
    const whereCondition =
      user.role === Role.ADMIN_MANAGER
        ? {}
        : { assignedUserId: user.id };

    const stageAggregations = await this.prisma.deal.groupBy({
      by: ['stage'],
      where: whereCondition,
      _sum: { value: true },
      _count: { id: true },
    });

    const stages = Object.values(DealStage);
    const metrics: Record<string, { totalValue: number; count: number }> = {};

    stages.forEach((stage) => {
      metrics[stage] = { totalValue: 0, count: 0 };
    });

    stageAggregations.forEach((item) => {
      metrics[item.stage] = {
        totalValue: item._sum.value || 0,
        count: item._count.id || 0,
      };
    });

    const totalPipelineValue = Object.values(metrics).reduce(
      (sum, val) => sum + val.totalValue,
      0,
    );
    const totalDeals = Object.values(metrics).reduce(
      (sum, val) => sum + val.count,
      0,
    );

    return {
      totalPipelineValue,
      totalDeals,
      stages: metrics,
    };
  }
}
