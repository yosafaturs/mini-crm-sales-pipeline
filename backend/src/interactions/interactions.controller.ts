import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/interaction.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('deals/:dealId/interactions')
export class InteractionsController {
  constructor(private interactionsService: InteractionsService) {}

  @Post()
  async create(
    @Param('dealId') dealId: string,
    @Body() dto: CreateInteractionDto,
    @GetUser() user: any,
  ) {
    return this.interactionsService.create(dealId, dto, user);
  }

  @Get()
  async findByDeal(@Param('dealId') dealId: string, @GetUser() user: any) {
    const interactions = await this.interactionsService.findByDeal(dealId, user);
    return { interactions };
  }
}
