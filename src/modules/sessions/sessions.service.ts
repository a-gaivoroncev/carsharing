import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SessionsService {
    constructor(private readonly db: DatabaseService) { }

    async calculateSession(dateFromString: string, dateToString: string) {
        const dateFrom = new Date(dateFromString);
        const dateTo = new Date(dateToString)

        if (!this.isWorkingDay(dateFrom) || !this.isWorkingDay(dateTo)) {
            throw new BadRequestException('You cant start/end rent at weekends')
        }

        const numberOfDays = this.calculateDaysRange(dateFrom, dateTo)

        if (numberOfDays > 30) {
            throw new BadRequestException('Max rent period error')
        }

        const rentPrice = this.caclulateRentPrice(numberOfDays)

        return {
            dateFrom,
            dateTo,
            rentPrice
        }
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
        let rate;
        for (let day = 0; day < numberOfDays; day++) {
            if (day < 4) {
                rate = 1
            } else if (day < 9) {
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

            const valid = this.areDatesValid(dateFrom, dateTo)
            if (!valid) {
                throw new BadRequestException('Date are not valid')
            }

            const isAvailable = await this.hasNotSessions(carId, dateFrom, dateTo)

            if (!isAvailable) {
                throw new BadRequestException('Car is not available for this date range')
            }

            const { rentPrice } = await this.calculateSession(dateFromString, dateToString)

            return this.db.executeQuery(
                `INSERT INTO rental_sessions 
                (rent_price, rent_date_from, rent_date_to, car_id) 
                VALUES ('${rentPrice}', '${dateFromString}', '${dateToString}', '${carId}') 
                RETURNING *`
            )

        } catch (error) {
            throw new Error(error.message)
        }
    }

    /* 
        найти по carId все сессии по carId 
    */

    private areDatesValid(dateFrom: Date, dateTo: Date) {
        return dateFrom < dateTo
    }

    async hasNotSessions(carId: string, dateFrom: Date, dateTo: Date) {
        // 3 дня до и после для брони

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
