import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { CarService } from './car.service';

@Controller('car')
export class CarController {
    constructor(private readonly carService: CarService, private readonly sessionService: SessionsService) { }

    @Get('/report')
    createReport(@Query('year') year: string, @Query('month') month: string) {
        return this.carService.createCarsReports(+year, +month)
    }

    @Get('/status/:carId')
    async checkCarStatus(@Param('carId') carId: string, @Query('fromDate') fromDate: string, @Query('toDate') toDate: string) {
        try {
            await this.sessionService.checkAvailableStatus(carId, new Date(fromDate), new Date(toDate))
            return true
        } catch (e) {
            throw new BadRequestException(e.message)
        }
    }
}
