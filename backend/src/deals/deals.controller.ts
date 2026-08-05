import { Controller, Get, Post, Put, Patch, Body, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { DealsService } from './deals.service';
import { CreateDealDto, UpdateDealDto, UpdateDealStageDto, AssignDealDto } from './dto/deal.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('deals')
export class DealsController {
  constructor(private dealsService: DealsService) {}

  @Get()
  async getAllDeals(@GetUser() user: any) {
    const deals = await this.dealsService.findAll(user);
    return { deals };
  }

  @Get('metrics')
  async getMetrics(@GetUser() user: any) {
    return this.dealsService.getStageMetrics(user);
  }

  @Get('export')
  @Roles('ADMIN_MANAGER')
  async exportDeals(@GetUser() user: any, @Res() res: Response) {
    const deals = await this.dealsService.findAll(user);
    
    // Format JSON export
    const exportData = deals.map((deal) => ({
      ID: deal.id,
      Title: deal.title,
      Value: deal.value,
      Stage: deal.stage,
      AssignedUser: deal.assignedUser?.name || deal.assignedUser?.email || 'Unassigned',
      CreatedBy: deal.createdBy?.name || deal.createdBy?.email,
      CreatedAt: deal.createdAt,
    }));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="crm_deals_export.json"');
    return res.send(JSON.stringify(exportData, null, 2));
  }

  @Get(':id')
  async getDeal(@Param('id') id: string, @GetUser() user: any) {
    return this.dealsService.findOne(id, user);
  }

  @Post()
  async createDeal(@Body() dto: CreateDealDto, @GetUser() user: any) {
    return this.dealsService.create(dto, user);
  }

  @Patch(':id/stage')
  async updateStage(
    @Param('id') id: string,
    @Body() dto: UpdateDealStageDto,
    @GetUser() user: any,
  ) {
    return this.dealsService.updateStage(id, dto, user);
  }

  @Patch(':id/assign')
  @Roles('ADMIN_MANAGER')
  async assignDeal(@Param('id') id: string, @Body() dto: AssignDealDto) {
    return this.dealsService.assign(id, dto);
  }

  @Put(':id')
  async updateDeal(
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
    @GetUser() user: any,
  ) {
    return this.dealsService.update(id, dto, user);
  }
}
