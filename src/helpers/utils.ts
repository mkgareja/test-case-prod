import PhoneNumber from 'awesome-phonenumber';
import * as moment from 'moment';
import { Constants } from '../config/constants';

export class Utils {
    /** Creating 6 digit random code for otp as well as referral code */
    public static createRandomcode = (length: number, isOTP: boolean) => {
        let code = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // for referral code generator
        if (isOTP) {
            characters = '0123456789'; // for otp generator
        }
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            code += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return code;
    };

    /** Format mobile number to e164 */
    public static formatPhoneNumber = (phoneNumber: string) => {
        const mobile = new PhoneNumber(phoneNumber, process.env.DEFAULT_COUNTRY_CODE);
        return mobile.getNumber('e164');
    };

    /** Get start and end time of day in particular format  */
    public static getDayStartAndEndTime = (date: string) => {
        return {
            startDate: moment(date).startOf('day').format(Constants.DATA_BASE_DATE_TIME_FORMAT),
            endDate: moment(date).endOf('day').format(Constants.DATA_BASE_DATE_TIME_FORMAT),
        };
    };

    /** Get start and end time of start and end date in particular format  */
    public static getStartAndEndDates = (startDate: string, endDate: string) => {
        return {
            startDate: moment(startDate).startOf('day').format(Constants.DATA_BASE_DATE_TIME_FORMAT),
            endDate: moment(endDate).endOf('day').format(Constants.DATA_BASE_DATE_TIME_FORMAT),
        };
    };

    /** convert date into ISO string */
    public static convertedTOISOString = (date: string) => {
        return date.replace(' ', 'T');
    };

    /** convert returned string from sql result to array by seperating comma */
    public static formatStringToArray = (result: any, type: string) => {
        if (result[type]) {
            if (result[type].indexOf(',') > 0) {
                result[type] = result[type].split(',');
            } else {
                result[type] = [result[type]];
            }
        } else {
            result[type] = [];
        }
        return result[type];
    };

    /** convert returned string object from sql result to array of objects */
    public static formatStringObjectsToArrayObjects = (result: any, type: string) => {
        if (result[type]) {
            result[type] = JSON.parse(result[type]);
        } else {
            result[type] = [];
        }
        return result[type];
    };

    /** convert dollar to cents */
    public static convertToCents = (amount: number) => {
        return amount * 100;
    };

    /** convert dollar to cents */
    public static convertFloatNumberToString = (amount: any) => {
        return parseFloat(amount).toFixed(2);
    };

    /** Get start and end time of day in particular format  */
    public static getMonthStartAndEndTime = (month: number) => {
        return {
            startDate: moment(month, 'MM').startOf('month').format(Constants.DATA_BASE_DATE_TIME_FORMAT),
            endDate: moment(month, 'MM').endOf('month').format(Constants.DATA_BASE_DATE_TIME_FORMAT),
        };
    };
    /** Get difference between two dates as days  */
    public static getDifferenceOfDates = (
        startDate: string,
        endDate: string,
        asHours: boolean = false
    ) => {
        let start: any;
        let end: any;
        // Difference in number of days/hours
        if (asHours) {
            start = moment(startDate, Constants.DATA_BASE_DATE_TIME_FORMAT);
            end = moment(endDate, Constants.DATA_BASE_DATE_TIME_FORMAT);
            return moment.duration(start.diff(end)).asHours();
        } else {
            start = moment(startDate, Constants.DATE_FORMAT);
            end = moment(endDate, Constants.DATE_FORMAT);
            return moment.duration(start.diff(end)).asDays();
        }
    };

    /** Get Time slot of a working day with given interval */
    public static getTimeSlots = (startTime: number, endTime: number, interval: number) => {
        const timeSlots = [];
        let start: any = moment(`${startTime}:00`, Constants.TIME_HOUR_MINUTE_FORMAT).format(
            Constants.TIME_HOUR_MINUTE_FORMAT
        );

        const loop = (endTime - startTime) * (60 / interval);

        for (let i = 1; i <= loop; i++) {
            const endOfStart = moment(start, Constants.TIME_HOUR_MINUTE_FORMAT)
                .add(interval, 'minutes')
                .format(Constants.TIME_HOUR_MINUTE_FORMAT);
            timeSlots.push(`${start}-${endOfStart}`);
            start = endOfStart;
        }
        return timeSlots;
    };

    public static capitalizeString(str) {
        return str[0].toUpperCase() + str.slice(1).toLowerCase();
    }

}
