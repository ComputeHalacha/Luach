import Zmanim from './Zmanim';
import jDate from './jDate';

export default class Utils {
    static jMonthsEng = ['', 'Nissan', 'Iyar', 'Sivan', 'Tamuz', 'Av', 'Ellul', 'Tishrei', 'Cheshvan', 'Kislev', 'Teves', 'Shvat', 'Adar', 'Adar Sheini'];
    static jMonthsHeb = ['', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול', 'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר', 'אדר שני'];
    static sMonthsEng = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    static dowEng = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Erev Shabbos', 'Shabbos Kodesh'];
    static dowHeb = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'ערב שבת קודש', 'שבת קודש'];
    static jsd = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    static jtd = ['י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    static jhd = ['ק', 'ר', 'ש', 'ת'];
    static jsnum = ['', 'אחד', 'שנים', 'שלשה', 'ארבעה', 'חמשה', 'ששה', 'שבעה', 'שמונה', 'תשעה'];
    static jtnum = ['', 'עשר', 'עשרים', 'שלושים', 'ארבעים'];

    /**
     * Gets the Jewish representation of a number (365 = שס"ה)
     * Minimum number is 1 and maximum is 9999.
     * @param {Number} number
     */
    static toJNum(number) {
        if (number < 1) {
            throw 'Min value is 1';
        }

        if (number > 9999) {
            throw 'Max value is 9999';
        }

        let n = number,
            retval = '';

        if (n >= 1000) {
            retval += Utils.jsd[Utils.toInt((n - (n % 1000)) / 1000) - 1] + '\'';
            n = n % 1000;
        }

        while (n >= 400) {
            retval += 'ת';
            n -= 400;
        }

        if (n >= 100) {
            retval += Utils.jhd[Utils.toInt((n - (n % 100)) / 100) - 1];
            n = n % 100;
        }

        if (n == 15) {
            retval += 'טו';
        }
        else if (n == 16) {
            retval += 'טז';
        }
        else {
            if (n > 9) {
                retval += Utils.jtd[Utils.toInt((n - (n % 10)) / 10) - 1];
            }
            if ((n % 10) > 0) {
                retval += Utils.jsd[(n % 10) - 1];
            }
        }
        if (number > 999 && (number % 1000 < 10)) {
            retval = '\'' + retval;
        }
        else if (retval.length > 1) {
            retval = (retval.slice(0, -1) + '"' + retval[retval.length - 1]);
        }
        return retval;
    }

    /**
     * Returns the javascript date in the format: Thursday, the 3rd of January 2018.
     * @param {Date} date
     * @param {Boolean} hideDayOfWeek
     * @param {Boolean} dontCapitalize
     */
    static toStringDate(date, hideDayOfWeek, dontCapitalize) {
        return (hideDayOfWeek ? (dontCapitalize ? 't' : 'T') :
            Utils.dowEng[date.getDay()] + ', t') +
            'he ' +
            Utils.toSuffixed(date.getDate()) + ' of ' +
            Utils.sMonthsEng[date.getMonth()] + ' ' +
            date.getFullYear().toString();
    }


    /**
     * Add two character suffix to number. e.g. 21st, 102nd, 93rd, 500th
     * @param {Number} num
     */
    static toSuffixed(num) {
        const t = num.toString();
        let suffix = 'th';
        if (t.length === 1 || (t[t.length - 2] !== '1')) {
            switch (t[t.length - 1]) {
                case '1':
                    suffix = 'st';
                    break;
                case '2':
                    suffix = 'nd';
                    break;
                case '3':
                    suffix = 'rd';
                    break;
            }
        }
        return t + suffix;
    }

    /**
     * Returns if the given full secular year has a February 29th
     * @param {Number} year
     */
    static isSecularLeapYear(year) {
        return !(year % 400) || (!!(year % 100) && !(year % 4));
    }

    /**
    * Get day of week using Javascripts getDay function.
    * Important note: months starts at 1 not 0 like javascript
    * The DOW returned has Sunday = 0
    * @param {Number} year
    * @param {Number} month
    * @param {Number} day
    */
    static getSdDOW(year, month, day) {
        return new Date(year, month - 1, day).getDay();
    }

    /**
     * Makes sure hour is between 0 and 23 and minute is between 0 and 59.
     * Overlaps get added/subtracted.
     * The argument needs to be an object in the format {hour : 12, minute :42 }
     * @param {{hour:Number, minute:Number}} hm
     */
    static fixHourMinute(hm) {
        //make a copy - javascript sends object parameters by reference
        const result = { hour: hm.hour, minute: hm.minute };
        while (result.minute < 0) {
            result.minute += 60;
            result.hour--;

        }
        while (result.minute >= 60) {
            result.minute -= 60;
            result.hour++;
        }
        if (result.hour < 0) {
            result.hour = 24 + (result.hour % 24);
        }
        if (result.hour > 23) {
            result.hour = result.hour % 24;
        }
        return result;
    }

    /**
    * Add the given number of minutes to the given time.
    * The argument needs to be an object in the format {hour : 12, minute :42 }
    *
    * @param {{hour:Number, minute:Number}} hm
    * @param {Number} minutes
    */
    static addMinutes(hm, minutes) {
        return Utils.fixHourMinute({ hour: hm.hour, minute: hm.minute + minutes });
    }

    /**
     * Gets the time difference between two times of day.
     * Both arguments need to be an object in the format {hour : 12, minute :42 }
     * @param {{hour:Number, minute:Number}} time1
     * @param {{hour:Number, minute:Number}} time2
     */
    static timeDiff(time1, time2) {
        return Utils.fixHourMinute(Utils.addMinutes(time1, Utils.totalMinutes(time2)));
    }

    /**
     * Gets the total number of minutes in the given time.
     * @param {{hour:Number, minute:Number}} time An object in the format {hour : 12, minute :42 }
     */
    static totalMinutes(time) {
        return (time.hour * 60) + time.minute;
    }

    /**
     * Returns the given time in a formatted string.     *
     * @param {{hour:Number, minute:Number}} hm An object in the format {hour : 23, minute :42 }
     * @param {Boolean} army If falsey, the returned string will be: 11:42 PM otherwise it will be 23:42
     * @param {Boolean} roundUp If falsey, the numbers will converted to a whole number by rounding down, otherwise, up.
     */
    static getTimeString(hm, army, roundUp) {
        const round = roundUp ? Math.ceil : Math.floor;
        hm = { hour: round(hm.hour), minute: round(hm.minute) };
        if (army) {
            return (hm.hour.toString() + ':' +
                (hm.minute < 10 ? '0' + hm.minute.toString() : hm.minute.toString()));
        }
        else {
            return (hm.hour <= 12 ? (hm.hour == 0 ? 12 : hm.hour) : hm.hour - 12).toString() +
                ':' +
                (hm.minute < 10 ? '0' + hm.minute.toString() : hm.minute.toString()) +
                (hm.hour < 12 ? ' AM' : ' PM');
        }
    }


    /**
     * Gets the UTC offset in whole hours for the users time zone.
     * Note: this is not affected by DST - unlike javascripts getTimezoneOffset() function which gives you the current offset.
     */
    static currUtcOffset() {
        const date = new Date(),
            jan = new Date(date.getFullYear(), 0, 1),
            jul = new Date(date.getFullYear(), 6, 1);
        return -Utils.toInt(Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset()) / 60);
    }

    /** Determines if the given date is within DST on the users system */
    static isDateDST(date) {
        return (-Utils.toInt(date.getTimezoneOffset() / 60)) !== Utils.currUtcOffset();
    }


    /** Determines if the users system is currently set to DST */
    static isDST() {
        return Utils.isDateDST(new Date());
    }

    /**
     * Determines if the given javascript date is during DST according to the USA rules
     * @param {Date} date A javascript Date object
     */
    static isUSA_DST(date) {
        const year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours();

        if (month < 3 || month == 12) {
            return false;
        }
        else if (month > 3 && month < 11) {
            return true;
        }

        //DST starts at 2 AM on the second Sunday in March
        else if (month === 3) { //March
            //Gets day of week on March 1st
            const firstDOW = Utils.getSdDOW(year, 3, 1),
                //Gets date of second Sunday
                targetDate = firstDOW == 0 ? 8 : ((7 - (firstDOW + 7) % 7)) + 8;

            return (day > targetDate || (day === targetDate && hour >= 2));
        }
        //DST ends at 2 AM on the first Sunday in November
        else //dt.Month == 11 / November
        {
            //Gets day of week on November 1st
            const firstDOW = Utils.getSdDOW(year, 11, 1),
                //Gets date of first Sunday
                targetDate = firstDOW === 0 ? 1 : ((7 - (firstDOW + 7) % 7)) + 1;

            return (day < targetDate || (day === targetDate && hour < 2));
        }
    }

    //
    /**
     * Determines if the given Javascript date is during DST according to the current (5776) Israeli rules
     * @param {Date} date A Javascript Date object
     */
    static isIsrael_DST(date) {
        const year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours();

        if (month > 10 || month < 3) {
            return false;
        }
        else if (month > 3 && month < 10) {
            return true;
        }
        //DST starts at 2 AM on the Friday before the last Sunday in March
        else if (month === 3) { //March
            //Gets date of the Friday before the last Sunday
            const lastFriday = (31 - Utils.getSdDOW(year, 3, 31)) - 2;
            return (day > lastFriday || (day === lastFriday && hour >= 2));
        }
        //DST ends at 2 AM on the last Sunday in October
        else //dt.Month === 10 / October
        {
            //Gets date of last Sunday in October
            const lastSunday = 31 - Utils.getSdDOW(year, 10, 31);
            return (day < lastSunday || (day === lastSunday && hour < 2));
        }
    }

    /** The current time in Israel - determined by the current users system time and time zone offset*/
    static getSdNowInIsrael() {
        const now = new Date(),
            //first determine the hour differential between this user and Israel time
            israelTimeOffset = 2 + -Utils.currUtcOffset();
        //This will give us the current correct date and time in Israel
        return new Date(now.setHours(now.getHours() + israelTimeOffset));
    }
    /**
     * Adds the given number of days to the given javascript date and returns the new date
     * @param {Date} sdate
     * @param {Number} days
     */
    static addDaysToSdate(sdate, days) {
        const dat = new Date(sdate.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    }
    /**
     * Compares two js dates to se if they both refer to the same day - time is ignored.
     * @param {Date} sdate1
     * @param {Date} sdate2
     */
    static isSameSdate(sdate1, sdate2) {
        return sdate1 && sdate2 && sdate1.toDateString() === sdate2.toDateString();
    }
    /**
     * Compares two jDates to se if they both refer to the same day - time is ignored.
     * @param {jDate} jdate1
     * @param {jDate} jdate2
     */
    static isSameJdate(jdate1, jdate2) {
        return jdate1 && jdate2 && jdate1.Abs && jdate2.Abs && jdate1.Abs === jdate2.Abs;
    }
    /**
     * Determines if the time of the given Date() is after sunset at the given Location
     * @param {Date} sdate
     * @param {Location} location
     */
    static isAfterSunset(sdate, location) {
        const sunriseSunset = Zmanim.getSunTimes(sdate, location),
            nowMinutes = (sdate.getHours() * 60) + sdate.getMinutes(),
            shkiaMinutes = Utils.totalMinutes(sunriseSunset.sunset);
        return nowMinutes >= shkiaMinutes;
    }
    /**
     * Gets the current Jewish Date at the given Location
     * @param {Location} location
     */
    static nowAtLocation(location) {
        const now = new Date(),
            isAfterSunset = Utils.isAfterSunset(now, location);
        return new jDate(jDate.absSd(now) + (isAfterSunset ? 1 : 0));
    }
    /**
     * Converts the given complex number to an integer by removing the decimal part.
     * Returns same results as Math.floor for positive numbers and Math.ceil for negative ones.
     * Almost identical functionality to Math.trunc and parseInt.
     * The difference is if the argument is NaN. Math.trunc returns NaN while ths fuction returns 0.
     * In performance tests, this function was found to be quicker than the alternatives.
     * @param {Number} float The complex number to convert to an integer
     */
    static toInt(float) {
        return float | 0;
    }
}