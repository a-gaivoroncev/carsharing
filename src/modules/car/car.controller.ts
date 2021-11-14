import { Controller, Get } from '@nestjs/common';
import { CarService } from './car.service';

@Controller('car')
export class CarController {
    constructor(private readonly carService: CarService) {}

    @Get()
    createTable() {
        return this.carService.createSession()
    }
}
