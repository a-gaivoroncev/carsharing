import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CarService {
    constructor(private readonly db: DatabaseService) {}
//create table "ingredients" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null);
    async createSession(
        // carNumber: string,dateFrom: string, dateTo: string
        ) {
        
    }
    
}
