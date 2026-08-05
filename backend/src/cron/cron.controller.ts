import { Controller, Post, UseGuards } from '@nestjs/common';
import { CronService } from './cron.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('cron')
export class CronController {
  constructor(private cronService: CronService) {}

  @Post('trigger-stale-check')
  @Roles('ADMIN_MANAGER')
  async triggerStaleCheck() {
    const result = await this.cronService.processStaleDeals();
    return {
      message: 'Stale deals check triggered successfully',
      result,
    };
  }
}
