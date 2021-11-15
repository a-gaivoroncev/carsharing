import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SeedService {
    constructor(private readonly db: DatabaseService) {}

    async seed() {
        await this.createTables()
        await this.seedCars()
    }

    async createTables() {
        await this.db.executeQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        await this.db.executeQuery(`CREATE TABLE IF NOT EXISTS cars 
            (id VARCHAR(6) NOT NULL PRIMARY KEY, 
            rental_availability BOOLEAN DEFAULT true);`)

        await this.db.executeQuery(`CREATE TABLE IF NOT EXISTS rental_sessions (id UUID NOT NULL DEFAULT uuid_generate_v1() NOT NULL PRIMARY KEY, 
            rent_price numeric DEFAULT 1000, 
            rent_date_from DATE NOT NULL,
            rent_date_to DATE NOT NULL, 
            car_id VARCHAR(6) NOT NULL REFERENCES cars(id));`
        )

    }

    async seedCars() {
        this.db.executeQuery(`INSERT INTO cars (id) VALUES ('a001bc') ON CONFLICT DO NOTHING`)
        this.db.executeQuery(`INSERT INTO cars (id) VALUES ('a002bc') ON CONFLICT DO NOTHING`)
        this.db.executeQuery(`INSERT INTO cars (id) VALUES ('a003bc') ON CONFLICT DO NOTHING`)
        this.db.executeQuery(`INSERT INTO cars (id) VALUES ('a004bc') ON CONFLICT DO NOTHING`)
        this.db.executeQuery(`INSERT INTO cars (id) VALUES ('a005bc') ON CONFLICT DO NOTHING`)
    }
}
