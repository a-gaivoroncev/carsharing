import { BadRequestException, Controller, Get, Post, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async createSession(@Query('carId') carId: string, @Query('dateTo') dateTo: string, @Query('dateFrom') dateFrom: string) {
      return this.sessionsService.createSession(carId, dateFrom, dateTo)
  }

  // @Get()
  // findSessions(@Query('carId') carId: string, @Query('dateTo') dateTo: string, @Query('dateFrom') dateFrom: string) {
  //   return this.sessionsService.hasNotSessions(carId, dateFrom, dateTo)
  // }
}
