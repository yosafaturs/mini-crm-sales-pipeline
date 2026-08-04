import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { DealStage } from '@prisma/client';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private prisma: PrismaService) {}

  // Run daily at midnight: 0 0 * * *
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleStaleDealsCheck() {
    this.logger.log('Starting daily Stale Deals background check...');
    await this.processStaleDeals();
  }

  // Exposed helper method for manual trigger or testing
  async processStaleDeals() {
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    try {
      // Find all deals NOT closed
      const activeDeals = await this.prisma.deal.findMany({
        where: {
          stage: {
            notIn: [DealStage.CLOSED_WON, DealStage.CLOSED_LOST],
          },
        },
        include: {
          assignedUser: { select: { id: true, email: true, name: true } },
          interactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const staleDeals = [];

      for (const deal of activeDeals) {
        const lastInteraction = deal.interactions[0];
        const lastActivityDate = lastInteraction
          ? new Date(lastInteraction.createdAt)
          : new Date(deal.createdAt);

        if (lastActivityDate < fourDaysAgo) {
          staleDeals.push({
            dealId: deal.id,
            title: deal.title,
            stage: deal.stage,
            assignedUser: deal.assignedUser?.email || 'Unassigned',
            lastActivity: lastActivityDate,
          });

          // Mock notification output as per spec requirement
          this.logger.warn(
            `[MOCK NOTIFICATION] Alert for Sales Exec (${deal.assignedUser?.email}): ` +
              `Deal '${deal.title}' (ID: ${deal.id}) in stage '${deal.stage}' has had no interaction for over 4 days! ` +
              `Last activity: ${lastActivityDate.toISOString()}`,
          );
        }
      }

      this.logger.log(
        `Completed Stale Deals check. Evaluated ${activeDeals.length} active deals; found ${staleDeals.length} stale deals needing follow-up.`,
      );

      return {
        processedCount: activeDeals.length,
        staleCount: staleDeals.length,
        staleDeals,
      };
    } catch (error) {
      this.logger.error('Error executing Stale Deals cron job', error.stack);
      throw error;
    }
  }
}
