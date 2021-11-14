import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SeedService {
    constructor(private readonly db: DatabaseService) {}

    async seed() {
        await this.createTables()
        await this.seedCars()
    }

        // EXAMPLE: INSERT INTO rental_sessions (rent_date_range) VALUES ('[2010-01-01 14:45, 2010-01-01 15:45)');


    async createTables() {
        await this.db.executeQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        await this.db.executeQuery(`CREATE TABLE IF NOT EXISTS cars 
            (id VARCHAR(6) NOT NULL PRIMARY KEY, 
            rental_availability BOOLEAN DEFAULT true);`)

        // await this.db.executeQuery(`CREATE TABLE IF NOT EXISTS rental_sessions (id UUID NOT NULL DEFAULT uuid_generate_v1() NOT NULL PRIMARY KEY, 
        //     rent_price numeric DEFAULT 1000, 
        //     rent_date_range tsrange NOT NULL, 
        //     car_id VARCHAR(6) NOT NULL REFERENCES cars(id));`)

        await this.db.executeQuery(`CREATE TABLE IF NOT EXISTS rental_sessions (id UUID NOT NULL DEFAULT uuid_generate_v1() NOT NULL PRIMARY KEY, 
            rent_price numeric DEFAULT 1000, 
            rent_date_from DATE NOT NULL,
            rent_date_to DATE NOT NULL, 
            car_id VARCHAR(6) NOT NULL REFERENCES cars(id));`
        )

            //   CREATE TABLE child (
            //     child_id integer primary key,
            //     parent_id integer not null references parent(parent_id),
            //     ...
            //   );
            
        // await this.db.executeQuery('ALTER TABLE "car" ADD CONSTRAIT "cars_pkey" primary key ("id")')
        // this.db.executeQuery('CREATE TABLE IF NOT EXISTS car (car_id int, column1 varchar(50));')
        // this.db.executeQuery('CREATE TABLE IF NOT EXISTS car (car_id int, column1 varchar(50));')
        // this.db.executeQuery('CREATE TABLE IF NOT EXISTS car (car_id int, column1 varchar(50));')
    }

    async seedCars() {
        this.db.executeQuery(`INSERT INTO cars (id) VALUES ('a001bc') ON CONFLICT DO NOTHING`)
        this.db.executeQuery(`INSERT INTO cars (id) VALUES ('a002bc') ON CONFLICT DO NOTHING`)
        this.db.executeQuery(`INSERT INTO cars (id) VALUES ('a003bc') ON CONFLICT DO NOTHING`)
        this.db.executeQuery(`INSERT INTO cars (id) VALUES ('a004bc') ON CONFLICT DO NOTHING`)
        this.db.executeQuery(`INSERT INTO cars (id) VALUES ('a005bc') ON CONFLICT DO NOTHING`)
    }
}
