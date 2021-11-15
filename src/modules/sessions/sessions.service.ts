import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SessionsService {
    constructor(private readonly db: DatabaseService) { }

    async calculateSession(dateFromString: string, dateToString: string) {
            const dateFrom = new Date(dateFromString);
            const dateTo = new Date(dateToString);
            if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
                throw new BadRequestException('Invalid date')
            }
            if (!this.isWorkingDay(dateFrom) || !this.isWorkingDay(dateTo)) {
                throw new BadRequestException('You cant start/end rent at weekends')
            }

            const rentPrice = this.calculateRentPrice(dateFrom, dateTo)

            return {
                dateFrom,
                dateTo,
                rentPrice
            }


    }

    calculateRentPrice(dateFrom, dateTo) {
        const numberOfDays = this.calculateDaysRange(dateFrom, dateTo)

        if (numberOfDays > 30) {
            throw new BadRequestException('Max rent period error')
        }

        return this.caclulateRentPrice(numberOfDays)
    }

    private calculateDaysRange(dateFrom: Date, dateTo: Date) {
        return ((dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24))
    }

    isWorkingDay(date: Date) {
        const dayOfWeek = date.getDay()
        return (dayOfWeek !== 0 && dayOfWeek !== 6)
    }

    caclulateRentPrice(numberOfDays: number) {
        let rentPrice = 0;
        const basePrice = 1000;
        let rate = 1;
        for (let day = 0; day < numberOfDays; day++) {
            if (day < 9 && day > 4) {
                rate = 0.95
            } else if (day < 17) {
                rate = 0.9
            } else if (day < 30) {
                rate = 0.85
            }
            rentPrice += basePrice * rate
        }
        return rentPrice
    }

    async createSession(carId: string, dateFromString: string, dateToString: string) {
        try {
            const dateFrom = new Date(dateFromString);
            const dateTo = new Date(dateToString);

            await this.checkAvailableStatus(carId, dateFrom, dateTo)

            const { rentPrice } = await this.calculateSession(dateFromString, dateToString)

            return this.db.executeQuery(
                `INSERT INTO rental_sessions 
                (rent_price, rent_date_from, rent_date_to, car_id) 
                VALUES ('${rentPrice}', '${dateFromString}', '${dateToString}', '${carId}') 
                RETURNING *`
            )
        } catch (e) {
            return {
                ok: false,
                description: e.message
            }
        }

    }

    async checkAvailableStatus(carId: string, dateFrom: Date, dateTo: Date) {
        const valid = this.areDatesValid(dateFrom, dateTo)
        if (!valid) {
            throw new Error('dates are not valid')
        }

        const isAvailable = await this.hasNotSessions(carId, dateFrom, dateTo)

        if (!isAvailable) {
            throw new Error('car is not available')
        }

    }

    private areDatesValid(dateFrom: Date, dateTo: Date) {
        return dateFrom < dateTo
    }

    async hasNotSessions(carId: string, dateFrom: Date, dateTo: Date) {
        dateFrom.setDate(dateFrom.getDate() - 3).toLocaleString()
        dateTo.setDate(dateTo.getDate() + 3).toLocaleString()

        const availableDateFrom = `${dateFrom.getFullYear()}-${dateFrom.getMonth() + 1}-${dateFrom.getDate()}`
        const availableDateTo = `${dateTo.getFullYear()}-${dateTo.getMonth() + 1}-${dateTo.getDate()}`

        const values = await this.db.executeQuery(`SELECT * FROM rental_sessions WHERE 
            car_id = '${carId}' 
            AND rent_date_from >= '${availableDateFrom}' 
            AND rent_date_to <= '${availableDateTo}'`)

        if (values.length) {
            return null
        }

        return !values.length
    }
}
