import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class CarService {
    constructor(private readonly db: DatabaseService) {}
    async createCarsReports(year: number, month: number) {
        const sessions = await this.db.executeQuery(`SELECT * FROM rental_sessions 
            WHERE EXTRACT(YEAR FROM rent_date_from) = ${year} 
            AND (EXTRACT(MONTH FROM rent_date_from) = ${month} 
            OR EXTRACT(MONTH FROM rent_date_to) = ${month})`)

        const days = this.parseRentDays(sessions, month, year)
        return days
    }
    
    parseRentDays(sessions: Array<any>, month: number, year: number) {
        const result = {}
        const lastDayOfMonth = new Date(year, month , 0).getDate()
        let amountOfDays = 0;

        for (const session of sessions) {
            
            const sessionDateFrom = new Date(session.rent_date_from)
            const sessionDateTo = new Date(session.rent_date_to)
            
            const monthFrom = sessionDateFrom.getMonth() + 1
            const monthTo = sessionDateTo.getMonth() + 1

            const dayFrom = sessionDateFrom.getDate()
            const dayTo = sessionDateTo.getDate()

            let numberOfDays = 0
            
            if (monthFrom === monthTo) {
                numberOfDays = dayTo - dayFrom
            } else if (monthFrom === month) {
                numberOfDays = lastDayOfMonth - dayFrom
            } else if (monthTo === month) {
                numberOfDays = dayTo
            }

            if (!result[session.car_id]) {
                result[session.car_id] = {
                    numberOfDays: 0,
                }
            }

            result[session.car_id].numberOfDays += numberOfDays
            amountOfDays += numberOfDays
        }

        for (const carId in result) {
            result[carId] = (100 * result[carId].numberOfDays / (lastDayOfMonth + 1)).toFixed(2) + '%'
        }

        const averageRentDays = amountOfDays / Object.keys(result).length
        const monthRentForAll = (100 * averageRentDays / lastDayOfMonth + 1).toFixed(2) + '%'

        return {monthRentForAll, ...result}
    }
}
