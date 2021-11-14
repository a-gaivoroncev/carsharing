import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseProviders } from '../database/database.providers';
import { DatabaseService } from '../database/database.service';
import { CarController } from './car.controller';
import { CarService } from './car.service';

@Module({
  imports: [DatabaseService, ConfigModule],
  controllers: [CarController],
  providers: [CarService, DatabaseService, ...databaseProviders],
  exports: [CarService]
})
export class CarModule {}
