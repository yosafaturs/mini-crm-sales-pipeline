import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInteractionDto } from './dto/interaction.dto';

@Injectable()
export class InteractionsService {
  constructor(private prisma: PrismaService) {}

  async create(dealId: string, dto: CreateInteractionDto, user: { id: string; role: string }) {
    const deal = await this.prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) {
      throw new NotFoundException(`Deal with ID ${dealId} not found`);
    }

    if (user.role !== 'ADMIN_MANAGER' && deal.assignedUserId !== user.id) {
      throw new ForbiddenException('You do not have permission to add interactions to this deal');
    }

    const interaction = await this.prisma.interactionLog.create({
      data: {
        dealId,
        type: dto.type as any,
        notes: dto.notes,
        date: dto.date ? new Date(dto.date) : new Date(),
        createdById: user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Touch deal updatedAt
    await this.prisma.deal.update({
      where: { id: dealId },
      data: { updatedAt: new Date() },
    });

    return interaction;
  }

  async findByDeal(dealId: string, user: { id: string; role: string }) {
    const deal = await this.prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) {
      throw new NotFoundException(`Deal with ID ${dealId} not found`);
    }

    if (user.role !== 'ADMIN_MANAGER' && deal.assignedUserId !== user.id) {
      throw new ForbiddenException('You do not have permission to view interactions for this deal');
    }

    return this.prisma.interactionLog.findMany({
      where: { dealId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: 'desc' },
    });
  }
}
