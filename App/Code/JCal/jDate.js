import { isString, isNumber, has, isValidDate } from '../GeneralUtils';
import Utils from './Utils.js';
import Sedra from './Sedra.js';
import PirkeiAvos from './PirkeiAvos.js';
import Zmanim from './Zmanim.js';
import DafYomi from './Dafyomi';

/** Keeps a "repository" of years that have had their elapsed days previously calculated. Format: { year:5776, elapsed:2109283 } */
const _yearCache = [];

/* ****************************************************************************************************************
 * Many of the date conversion algorithmsin the jDate class are based on the C code which was translated from Lisp
 * in "Calendrical Calculations" by Nachum Dershowitz and Edward M. Reingold
 * in Software---Practice & Experience, vol. 20, no. 9 (September, 1990), pp. 899--928.
 * ****************************************************************************************************************/

/** Represents a single day in the Jewish Calendar. */
export default class jDate {
    /**
    *  Create a new Jdate.
    *  new jDate() - Sets the Jewish Date for the current system date
    *  new jDate(javascriptDateObject) - Sets to the Jewish date on the given Gregorian date
    *  new jDate("January 1 2045") - Accepts any valid javascript Date string (uses javascripts new Date(String))
    *  new jDate(jewishYear, jewishMonth, jewishDay) - Months start at 1. Nissan is month 1 Adar Sheini is 13.
    *  new jDate(jewishYear, jewishMonth) - Same as above, with Day defaulting to 1
    *  new jDate( { year: 5776, month: 4, day: 5 } ) - same as new jDate(jewishYear, jewishMonth, jewishDay)
    *  new jDate( { year: 5776, month: 4 } ) - same as new jDate(jewishYear, jewishMonth)
    *  new jDate( { year: 5776 } ) - sets to the first day of Rosh Hashana on the given year
    *  new jDate(absoluteDate) - The number of days elapsed since the theoretical date Sunday, December 31, 0001 BCE
    *  new jDate(jewishYear, jewishMonth, jewishDay, absoluteDate) - Most efficient constructor. Needs no calculations at all.
    *  new jDate( { year: 5776, month: 4, day: 5, abs: 122548708 } ) - same as new jDate(jewishYear, jewishMonth, jewishDay, absoluteDate)
    * @param {Number | Date |String | {year:Number,month:Number,day:Number} | [Number, Number, Number, Number]} arg The full Jewish year number OR Javascript Date object or string OR object or array of year, month, day
    * @param {Number} [month] The month of the Jewish date. Nissan is 1.
    * @param {Number} [day] The day of the month
    * @param {Number} [abs] The number of days that have passed since 12/31/0001
    */
    constructor(arg, month, day, abs) {
        //The day of the Jewish Month
        this.Day = NaN;
        //The Jewish Month. As in the Torah, Nissan is 1 and Adara Sheini is 13
        this.Month = NaN;
        //The Number of years since the creation of the world
        this.Year = NaN;
        //The number of days since the theoretical date: Dec. 31, 0001 BCE
        this.Abs = NaN;

        if (arguments.length === 0) {
            this.fromAbs(jDate.absSd(new Date()));
        }
        else if (arg instanceof Date) {
            if (isValidDate(arg)) {
                this.fromAbs(jDate.absSd(arg));
            }
            else {
                throw new Error('jDate constructor: The given Date is not a valid javascript Date');
            }
        }
        else if (Array.isArray(arg) && arg.length >= 3) {
            this.Day = arg[0];
            this.Month = arg[1];
            this.Year = arg[2];
            this.Abs = (arg.length > 3 && arg[3]) || jDate.absJd(this.Year, this.Month, this.Day);
        }
        else if (isString(arg)) {
            const d = new Date(arg);
            if (isValidDate(d)) {
                this.fromAbs(jDate.absSd(d));
            }
            else {
                throw new Error('jDate constructor: The given string "' + arg +
                    '" cannot be parsed into a Date');
            }
        }
        else if (isNumber(arg)) {
            //if no other arguments were supplied, we assume that the supplied number is an absolute date
            if (arguments.length === 1) {
                this.fromAbs(arg);
            }
            //If the year and any other number is supplied, we set the year and create the date using either the supplied values or the defaults
            else {
                this.Year = arg;
                this.Month = month || 7; //If no month was supplied, we take Tishrei
                this.Day = day || 1; //If no day was supplied, we take the first day of the month
                //If the absolute date was also supplied (very efficient), we use the supplied value, otherwise we calculate it.
                this.Abs = abs || jDate.absJd(this.Year, this.Month, this.Day);
            }
        }
        //If arg is an object that has a "year" property that contains a valid value...
        else if (typeof arg === 'object' && isNumber(arg.year)) {
            this.Day = arg.day || 1;
            this.Month = arg.month || 7;
            this.Year = arg.year;
            this.Abs = arg.abs || jDate.absJd(this.Year, this.Month, this.Day);
        }
    }

    /**Sets the current Jewish date from the given absolute date*/
    fromAbs(absolute) {
        const ymd = jDate.fromAbs(absolute);
        this.Year = ymd.year;
        this.Month = ymd.month;
        this.Day = ymd.day;
        this.Abs = absolute;
    }

    /**Returns a valid javascript Date object that represents the Gregorian date
    that starts at midnight of the current Jewish date.*/
    getDate() {
        return jDate.sdFromAbs(this.Abs);
    }
    /**The day of the week for the current Jewish date. Sunday is 0 and Shabbos is 6.*/
    getDayOfWeek() {
        return Math.abs(this.Abs % 7);
    }
    /**The day of the week for the current Jewish date. Sunday is 0 and Shabbos is 6.*/
    get DayOfWeek() {
        return this.getDayOfWeek();
    }
    /**Returns a new Jewish date represented by adding the given number of days to the current Jewish date.*/
    addDays(days) {
        return new jDate(this.Abs + days);
    }
    /**
     * Returns a new Jewish date represented by adding the given number of
     * Jewish Months to the current Jewish date.
     * If the current Day is 30 and the new month only has 29 days,
     * the 29th day of the month is returned.
     * @param {Number} months
     */
    addMonths(months) {
        let year = this.Year,
            month = this.Month,
            day = this.Day,
            miy = jDate.monthsJYear(year);

        for (let i = 0; i < Math.abs(months); i++) {
            if (months > 0) {
                month += 1;
                if (month > miy) {
                    month = 1;
                }
                if (month === 7) {
                    year += 1;
                    miy = jDate.monthsJYear(year);
                }
            }
            else if (months < 0) {
                month -= 1;
                if (month === 0) {
                    month = miy;
                }
                if (month === 6) {
                    year -= 1;
                    miy = jDate.monthsJYear(year);
                }
            }
        }
        if (day === 30 && jDate.daysJMonth(year, month) === 29) {
            day = 29;
        }

        return new jDate(year, month, day);
    }
    /**
     * Returns a new Jewish date represented by adding the
     * given number of Jewish Years to the current Jewish date.
     * If the current Day is 30 and the new dates month only has 29 days,
     * the 29th day of the month is returned.
     * @param {Number} years
     */
    addYears(years) {
        let year = this.Year + years,
            month = this.Month,
            day = this.Day;

        if (month === 13 && !jDate.isJdLeapY(year)) {
            month = 12;
        }
        else if (month === 8 && day === 30 && !jDate.isLongCheshvan(year)) {
            month = 9;
            day = 1;
        }
        else if (month === 9 && day === 30 && jDate.isShortKislev(year)) {
            month = 10;
            day = 1;
        }

        if (day === 30 && jDate.daysJMonth(year, month) === 29) {
            day = 29;
        }

        return new jDate(year, month, day);
    }
    addSecularMonths(months) {
        const secDate = this.getDate();
        return new jDate(new Date(secDate.setMonth(secDate.getMonth() + months)));
    }
    addSecularYears(years) {
        const secDate = this.getDate();
        return new jDate(new Date(secDate.setFullYear(secDate.getFullYear() + years)));
    }
    /**Gets the number of days separating this Jewish Date and the given one.
     *
     * If the given date is before this one, the number will be negative.*/
    diffDays(jd) {
        return jd.Abs - this.Abs;
    }

    /**Gets the number of months separating this Jewish Date and the given one.
     *
     * Ignores the Day property:
     *
     * jDate.toJDate(5777, 6, 29).diffMonths(jDate.toJDate(5778, 7, 1)) will return 1 even though they are a day apart.
     *
     * If the given date is before this one, the number will be negative.*/
    diffMonths(jd) {
        let month = jd.Month,
            year = jd.Year,
            months = 0;

        while (!(year === this.Year && month === this.Month)) {
            if (this.Abs > jd.Abs) {
                months--;
                month++;
                if (month > jDate.monthsJYear(year)) {
                    month = 1;
                }
                else if (month === 7) {
                    year++;
                }
            }
            else {
                months++;
                month--;
                if (month < 1) {
                    month = jDate.monthsJYear(year);
                }
                else if (month === 6) {
                    year--;
                }
            }
        }

        return months;
    }

    /**Gets the number of years separating this Jewish Date and the given one.
     *
     * Ignores the Day and Month properties:
     *
     * jDate.toJDate(5777, 6, 29).diffYears(jDate.toJDate(5778, 7, 1)) will return 1 even though they are a day apart.
     *
     * If the given date is before this one, the number will be negative.*/
    diffYears(jd) {
        return jd.Year - this.Year;
    }

    /**Returns the current Jewish date in the format: Thursday, the 3rd of Kislev 5776.*/
    toString(hideDayOfWeek, dontCapitalize) {
        return (hideDayOfWeek ? (dontCapitalize ? 't' : 'T') : Utils.dowEng[this.getDayOfWeek()] + ', t') +
            'he ' +
            Utils.toSuffixed(this.Day) + ' of ' +
            Utils.jMonthsEng[this.Month] + ' ' +
            this.Year.toString();
    }

    /**
     * Returns the current Jewish date in the format "[Tuesday] Nissan 3, 5778"
     * @param {bool} showDow - show day of week?
     */
    toShortString(showDow) {
        return ((showDow ? Utils.dowEng[this.getDayOfWeek()] + ' ' : '') +
            Utils.jMonthsEng[this.Month] + ' ' +
            this.Day.toString()) + ', ' +
            this.Year.toString();
    }

    /**Returns the current Jewish date in the format: יום חמישי כ"א כסלו תשע"ו.*/
    toStringHeb() {
        return Utils.dowHeb[this.getDayOfWeek()] + ' ' +
            Utils.toJNum(this.Day) + ' ' +
            Utils.jMonthsHeb[this.Month] + ' ' +
            Utils.toJNum(this.Year % 1000);
    }

    /**Gets the day of the omer for the current Jewish date. If the date is not during sefira, 0 is returned.*/
    getDayOfOmer() {
        let dayOfOmer = 0;
        if ((this.Month === 1 && this.Day > 15) || this.Month === 2 || (this.Month === 3 && this.Day < 6)) {
            const first = new jDate(this.Year, 1, 15);
            dayOfOmer = first.diffDays(this);
        }
        return dayOfOmer;
    }

    /**Gets an array[string] of holidays, fasts and any other special specifications for the current Jewish date.*/
    getHolidays(israel, hebrew) {
        return jDate.getHolidays(this, israel, hebrew);
    }
    /**
     * Gets a string with the name of a major holidays or fast
     */
    getMajorHoliday(israel, hebrew) {
        return jDate.getMajorHoliday(this, israel, hebrew);
    }

    /**Is the current Jewish Date the day before a yomtov that contains a Friday?*/
    hasEiruvTavshilin(israel) {
        let dow = this.getDayOfWeek();
        //No Eiruv Tavshilin ever on Sunday, Monday, Tuesday, Friday or Shabbos
        return (!has(dow, 0, 1, 2, 5, 6)) &&
            //Erev Yomtov (we already ruled out Erev Shabbos)
            this.hasCandleLighting() &&
            //Not erev yom kippur
            this.Day !== 9 &&
            //Erev rosh hashana on Wednesday OR erev yomtov in Chu"l on wednesday or Thursday OR erev yomtov in Israel on Thursday
            (this.Month === 6 || ((!israel) && has(dow, 3, 4)) || (israel && dow === 4));
    }

    /**Does the current Jewish date have candle lighting before sunset?*/
    hasCandleLighting() {
        const dow = this.getDayOfWeek();

        if (dow === 5) {
            return true;
        }
        else if (dow === 6) {
            //there is no "candle lighting time" - even if yom tov is on Motzai Shabbos
            return false;
        }

        return (this.Month === 1 && has(this.Day, 14, 20)) ||
            (this.Month === 3 && this.Day === 5) ||
            (this.Month === 6 && this.Day === 29) ||
            (this.Month === 7 && has(this.Day, 9, 14, 21));
    }

    /**Gets the candle lighting time for the current Jewish date for the given Location object.*/
    getCandleLighting(location) {
        if (!location) {
            throw new Error('To get sunrise and sunset, the location needs to be supplied');
        }
        if (this.hasCandleLighting()) {
            return Zmanim.getCandleLighting(this, location);
        }
        else {
            throw new Error('No candle lighting on ' + this.toString());
        }
    }

    /**Get the sedra of the week for the current Jewish date.*/
    getSedra(israel) {
        return new Sedra(this, israel);
    }

    /**Get the prakim of Pirkei Avos for the current Jewish date.*/
    getPirkeiAvos(israel) {
        return PirkeiAvos.getPrakim(this, israel);
    }

    /**Gets sunrise and sunset time for the current Jewish date at the given Location.
     *
     * Return format: {sunrise: {hour: 6, minute: 18}, sunset: {hour: 19, minute: 41}}*/
    getSunriseSunset(location, ignoreElevation) {
        if (!location) {
            throw new Error('To get sunrise and sunset, the location needs to be supplied');
        }
        return Zmanim.getSunTimes(this, location, !ignoreElevation);
    }

    /**Gets Chatzos for both the day and the night for the current Jewish date at the given Location.
     *
     *Return format: {hour: 11, minute: 48}*/
    getChatzos(location) {
        if (!location) {
            throw new Error('To get Chatzos, the location needs to be supplied');
        }
        return Zmanim.getChatzos(this, location);
    }

    /**Gets the length of a single Sha'a Zmanis in minutes for the current Jewish date at the given Location.*/
    getShaaZmanis(location, offset) {
        if (!location) {
            throw new Error('To get the Shaa Zmanis, the location needs to be supplied');
        }
        return Zmanim.getShaaZmanis(this, location, offset);
    }

    /**Returns the daily daf in English. For example: Sukkah, Daf 3.*/
    getDafYomi() {
        return DafYomi.toString(this);
    }

    /**Gets the daily daf in Hebrew. For example: 'סוכה דף כ.*/
    getDafyomiHeb() {
        return DafYomi.toStringHeb(this);
    }

    getAllDetails(location) {
        const list = [],
            sdate = this.getDate(),
            dailyInfos = this.getHolidays(location.Israel),
            { sunrise, sunset } = this.getSunriseSunset(location),
            suntimesMishor = this.getSunriseSunset(location, true),
            sunriseMishor = suntimesMishor.sunrise,
            sunsetMishor = suntimesMishor.sunset,
            candles = this.hasCandleLighting() &&
                Zmanim.getCandleLightingFromSunTimes({ sunrise, sunset }, location),
            mishorNeg90 = Utils.addMinutes(sunriseMishor, -90),
            chatzos = sunriseMishor && sunsetMishor &&
                Zmanim.getChatzosFromSuntimes(suntimesMishor),
            shaaZmanis = sunriseMishor && sunsetMishor &&
                Zmanim.getShaaZmanisFromSunTimes(suntimesMishor),
            shaaZmanis90 = sunriseMishor && sunsetMishor &&
                Zmanim.getShaaZmanisFromSunTimes(suntimesMishor, 90),
            addItem = (title, value, important) => list.push({ title, value, important });

        addItem('Jewish Date', this.toString());
        addItem('Secular Date', Utils.toStringDate(sdate, true));
        for (let h of dailyInfos) {
            addItem(h, null, true);
        }
        if (candles) {
            addItem('Candle Lighting', Utils.getTimeString(candles), true);
        }
        if (this.hasEiruvTavshilin()) {
            addItem('Eiruv Tavshilin', null, true);
        }
        addItem('Parsha of the week',
            this.getSedra(location.Israel).map((s) => s.eng).join(' - '));
        addItem('Daf Yomi', this.getDafYomi());
        addItem('Alos Hashachar - 90',
            Utils.getTimeString(mishorNeg90, false, true));
        addItem('Alos Hashachar - 72',
            Utils.getTimeString(Utils.addMinutes(sunriseMishor, -72), false, true));
        addItem('Netz Hachama - Sunrise',
            sunrise ? Utils.getTimeString(sunrise, false, true) : 'Sun does not rise', true);
        if (Utils.totalMinutes(sunrise) !== Utils.totalMinutes(sunriseMishor)) {
            addItem('Sunrise at sea level',
                Utils.getTimeString(sunriseMishor, false, true));
        }
        addItem('Krias Shma - MG"A',
            Utils.getTimeString(Utils.addMinutes(mishorNeg90, Math.floor(shaaZmanis90 * 3))));
        addItem('Krias Shma - GR"A',
            Utils.getTimeString(Utils.addMinutes(sunriseMishor, Math.floor(shaaZmanis * 3))));
        addItem('Zeman Tefillah - MG"A',
            Utils.getTimeString(Utils.addMinutes(mishorNeg90, Math.floor(shaaZmanis90 * 4))));
        addItem('Zeman Tefillah - GR"A',
            Utils.getTimeString(Utils.addMinutes(sunriseMishor, Math.floor(shaaZmanis * 4))));
        if (this.Month === 1 && this.Day === 14) {
            const neg90 = Utils.addMinutes(sunrise, -90);
            addItem('Stop eating Chometz',
                Utils.getTimeString(Utils.addMinutes(neg90, Math.floor(shaaZmanis90 * 4))));
            addItem('Burn Chometz before',
                Utils.getTimeString(Utils.addMinutes(neg90, Math.floor(shaaZmanis90 * 5))));
        }
        if (sunrise && sunset) {
            addItem('Chatzos - Day & Night',
                Utils.getTimeString(chatzos));
            addItem('Mincha Gedolah',
                Utils.getTimeString(Utils.addMinutes(chatzos, (shaaZmanis * 0.5))));
            addItem('Mincha Ktanah',
                Utils.getTimeString(Utils.addMinutes(sunriseMishor, (shaaZmanis * 9.5))));
            addItem('Plag Hamincha',
                Utils.getTimeString(Utils.addMinutes(sunriseMishor, (shaaZmanis * 10.75))));
        }
        if (!sunset) {
            addItem('Shkias Hachama - sunset', 'The sun does not set', true);
        }
        else {
            if (Utils.totalMinutes(sunset) === Utils.totalMinutes(sunsetMishor)) {
                addItem('Shkias Hachama - sunset',
                    Utils.getTimeString(sunset), true);
            }
            else {
                addItem('Sunset at Sea Level', Utils.getTimeString(sunsetMishor));
                addItem('Shkiah at ' + (location.Elevation * 3.28084).toString() + ' ft.',
                    Utils.getTimeString(sunset), true);
            }
            addItem('Nightfall 45',
                Utils.getTimeString(Utils.addMinutes(sunset, 45)));
            addItem('Rabbeinu Tam',
                Utils.getTimeString(Utils.addMinutes(sunset, 72)));
            addItem('72 "Zmaniot"',
                Utils.getTimeString(Utils.addMinutes(sunset, (shaaZmanis * 1.2))));
            addItem('72 "Zmaniot MA"',
                Utils.getTimeString(Utils.addMinutes(sunset, (shaaZmanis90 * 1.2))));
        }
        return list;
    }


    /**
    *  Converts its argument/s to a Jewish Date.
    *  Samples of use:
    *    To get the current Jewish Date: jDate.toJDate(new Date()).
    *    To print out the current date in English: jDate.toJDate(new Date()).toString()
    *    To print out the current date in Hebrew: jDate.toJDate(new Date()).toStringHeb()
    *
    *  Arguments to the jDate.toJDate function can be one of the following:
    *  jDate.toJDate() - Sets the Jewish Date for the current system date
    *  jDate.toJDate(Date) - Sets to the Jewish date on the given Javascript Date object
    *  jDate.toJDate("January 1 2045") - Accepts any valid Javascript Date string (uses string constructor of Date object)
    *  jDate.toJDate(jewishYear, jewishMonth, jewishDay) - Months start at 1. Nissan is month 1 Adara Sheini is 13.
    *  jDate.toJDate(jewishYear, jewishMonth) - Same as above, with Day defaulting to 1
    *  jDate.toJDate(jewishYear) - sets to the first day of Rosh Hashana on the given year
    *  jDate.toJDate( { year: 5776, month: 4, day: 5 } ) - Months start at 1. Nissan is month 1 Adara Sheini is 13.
    *  jDate.toJDate( { year: 5776, month: 4 } ) - Same as above, with Day defaulting to 1
    *  jDate.toJDate( { year: 5776 } ) - sets to the first day of Rosh Hashana on the given year
    *  jDate.toJDate(jewishYear, jewishMonth, jewishDay, absoluteDate) - Most efficient. Needs no calculations at all. The absoluteDate is the number of days elapsed since the theoretical date Sunday, December 31, 0001 BCE.
    *  jDate.toJDate( { year: 5776, month: 4, day: 5, abs: 122548708 } ) - same as jDate.toJDate(jewishYear, jewishMonth, jewishDay, absoluteDate)
    ****************************************************************************************************************/
    static toJDate(arg, month, day, abs) {
        if (arguments.length === 0) {
            return new jDate();
        }
        // If just the year is set, then the date is set to Rosh Hashana of that year.
        // In the above scenario, we can't just pass the args along, as the constructor will treat it as an absolute date.
        //...and that folks, is actually the whole point of this function...
        else if (isNumber(arg) && arguments.length === 1) {
            return new jDate(arg, 7, 1);
        }
        else {
            return new jDate(arg, month, day, abs);
        }
    }

    /**Calculate the Jewish year, month and day for the given absolute date.*/
    static fromAbs(absDay) {
        //To save on calculations, start with a few years before date
        let year = 3761 + Utils.toInt(absDay / (absDay > 0 ? 366 : 300)),
            month,
            day;

        // Search forward for year from the approximation year.
        while (absDay >= jDate.absJd(year + 1, 7, 1)) {
            year++;
        }
        // Search forward for month from either Tishrei or Nissan.
        month = (absDay < jDate.absJd(year, 1, 1) ? 7 : 1);
        while (absDay > jDate.absJd(year, month, jDate.daysJMonth(year, month))) {
            month++;
        }
        // Calculate the day by subtraction.
        day = (absDay - jDate.absJd(year, month, 1) + 1);

        return { year, month, day };
    }
    /**
     * Gets the absolute date of the given javascript Date object.
     * @param {Date} date
     */
    static absSd(date) {
        const msPerDay = 86400000, //The number of milliseconds per each day
            dateMs = date.valueOf() - (date.getTimezoneOffset() * 60000), //The number of ms since 1/1/1970.
            numFullDays = Math.floor(dateMs / msPerDay), //The number of full days since 1/1/1970.
            startAbs = 719163; //The Absolute Date for the zero day of the js Date object - 1/1/1970.,

        return startAbs + numFullDays;
    }

    /**Calculate the absolute date for the given Jewish Date.*/
    static absJd(year, month, day) {
        //The number of total days.
        let dayInYear = day; // day is the number of days so far this month.
        if (month < 7) { // Before Tishrei, so add days in prior months this year before and after Nissan.
            let m = 7;
            while (m <= (jDate.monthsJYear(year))) {
                dayInYear += jDate.daysJMonth(year, m);
                m++;
            }
            m = 1;
            while (m < month) {
                dayInYear += jDate.daysJMonth(year, m);
                m++;
            }
        }
        else { // Add days in prior months this year
            let m = 7;
            while (m < month) {
                dayInYear += jDate.daysJMonth(year, m);
                m++;
            }
        }
        // Days elapsed before absolute date 1. -  Days in prior years.
        return dayInYear + (jDate.tDays(year) + (-1373429));
    }

    /**
     * Gets a javascript date from an absolute date
     */
    static sdFromAbs(abs) {
        const startAbs = 719163, //The Absolute Date for the zero day of the js Date object - 1/1/1970.
            daysFromStart = abs - startAbs, //The number of days since 1/1/1970
            msPerDay = 86400000; //The number of milliseconds per day

        return new Date(daysFromStart * msPerDay);
    }

    /**Number of days in the given Jewish Month. Nissan is 1 and Adar Sheini is 13.*/
    static daysJMonth(year, month) {
        //Nissan, Sivan, Av, Tishrei and Shvat always have 30 days/
        //Note, this first if is technichally unnessesary as the else below also returns 30,
        //but we do it here to save unnessesary checks of the "else if".
        if ([1, 3, 5, 7, 11].includes(month)) {
            return 30;
        }
        //Iyyar, Tammuz, Ellul, Teves and Adar Sheini always have 29 days.
        else if ([2, 4, 6, 10, 13].includes(month) ||
            //Cheshvan and Kislev are sometimes 29 days and sometimes 30 days.
            ((month === 8) && (!jDate.isLongCheshvan(year))) ||
            ((month === 9) && jDate.isShortKislev(year)) ||
            //Adar has 29 days unless it is Adar Rishon.
            ((month === 12) && (!jDate.isJdLeapY(year)))) {
            return 29;
        }
        else {
            return 30;
        }
    }

    /**Elapsed days since creation of the world until Rosh Hashana of the given year*/
    static tDays(year) {
        /*As this function is called many times, often on the same year for all types of calculations,
        we save a list of years with their elapsed values.*/
        const cached = _yearCache.find(y => y.year === year);
        //If this year was already calculated and cached, then we return the cached value.
        if (cached) {
            return cached.elapsed;
        }

        const months = Utils.toInt((235 * Utils.toInt((year - 1) / 19)) + // Leap months this cycle
            (12 * ((year - 1) % 19)) +                        // Regular months in this cycle.
            (7 * ((year - 1) % 19) + 1) / 19),                // Months in complete cycles so far.
            parts = 204 + 793 * (months % 1080),
            hours = 5 + 12 * months + 793 * Utils.toInt(months / 1080) + Utils.toInt(parts / 1080),
            conjDay = Utils.toInt(1 + 29 * months + hours / 24),
            conjParts = 1080 * (hours % 24) + parts % 1080;

        let altDay;
        /* at the end of a leap year -  15 hours, 589 parts or later... -
        ... or is on a Monday at... -  ...of a common year, -
        at 9 hours, 204 parts or later... - ...or is on a Tuesday... -
        If new moon is at or after midday,*/
        if ((conjParts >= 19440) ||
            (((conjDay % 7) === 2) && (conjParts >= 9924) && (!jDate.isJdLeapY(year))) ||
            (((conjDay % 7) === 1) && (conjParts >= 16789) && (jDate.isJdLeapY(year - 1)))) {
            // Then postpone Rosh HaShanah one day
            altDay = (conjDay + 1);
        }
        else {
            altDay = conjDay;
        }

        // A day is added if Rosh HaShanah would occur on Sunday, Friday or Wednesday,
        if (has(altDay % 7, 0, 3, 5)) {
            altDay += 1;
        }

        //Add this year to the cache to save on calculations later on
        _yearCache.push({ year: year, elapsed: altDay });

        return altDay;
    }

    /**Number of days in the given Jewish Year.*/
    static daysJYear(year) {
        return ((jDate.tDays(year + 1)) - (jDate.tDays(year)));
    }

    /**Does Cheshvan for the given Jewish Year have 30 days?*/
    static isLongCheshvan(year) {
        return (jDate.daysJYear(year) % 10) === 5;
    }

    /**Does Kislev for the given Jewish Year have 29 days?*/
    static isShortKislev(year) {
        return (jDate.daysJYear(year) % 10) === 3;
    }

    /**Does the given Jewish Year have 13 months?*/
    static isJdLeapY(year) {
        return (((7 * year) + 1) % 19) < 7;
    }

    /**Number of months in Jewish Year.*/
    static monthsJYear(year) {
        return jDate.isJdLeapY(year) ? 13 : 12;
    }

    /**
     * Gets an Array[String] of holidays, fasts and any other special specifications for the given Jewish date.
     */
    static getHolidays(jd, israel, hebrew) {
        const list = [],
            jYear = jd.Year,
            jMonth = jd.Month,
            jDay = jd.Day,
            dayOfWeek = jd.getDayOfWeek(),
            isLeapYear = jDate.isJdLeapY(jYear),
            secDate = jd.getDate();

        if (dayOfWeek === 5) {
            list.push(!hebrew ? 'Erev Shabbos' : 'ערב שבת');
        }
        else if (dayOfWeek === 6) {
            list.push(!hebrew ? 'Shabbos Kodesh' : 'שבת קודש');

            if (jMonth === 1 && jDay > 7 && jDay < 15) {
                list.push(!hebrew ? 'Shabbos HaGadol' : 'שבת הגדול');
            }
            else if (jMonth === 7 && jDay > 2 && jDay < 10) {
                list.push(!hebrew ? 'Shabbos Shuva' : 'שבת שובה');
            }
            else if (jMonth === 5 && jDay > 2 && jDay < 10) {
                list.push(!hebrew ? 'Shabbos Chazon' : 'שבת חזון');
            }
            else if ((jMonth === (isLeapYear ? 12 : 11) && jDay > 23 && jDay < 30) ||
                (jMonth === (isLeapYear ? 13 : 12) && jDay === 1)) {
                list.push(!hebrew ? 'Parshas Shkalim' : 'פרשת שקלים');
            }
            else if (jMonth === (isLeapYear ? 13 : 12) && jDay > 7 && jDay < 14) {
                list.push(!hebrew ? 'Parshas Zachor' : 'פרשת זכור');
            }
            else if (jMonth === (isLeapYear ? 13 : 12) && jDay > 16 && jDay < 24) {
                list.push(!hebrew ? 'Parshas Parah' : 'פרשת פרה');
            }
            else if ((jMonth === (isLeapYear ? 13 : 12) && jDay > 23 && jDay < 30) ||
                (jMonth === 1 && jDay === 1)) {
                list.push(!hebrew ? 'Parshas Hachodesh' : 'פרשת החודש');
            }

            //All months but Tishrei have Shabbos Mevarchim on the Shabbos before Rosh Chodesh
            if (jMonth != 6 && jDay > 22 && jDay < 30)
                list.push(!hebrew ? 'Shabbos Mevarchim' : 'מברכים החודש');

            const pa = jd.getPirkeiAvos(israel);
            if (pa.length) {
                list.push(!hebrew ? 'Pirkei Avos - ' +
                    pa.map(s => Utils.toSuffixed(s) + ' Perek').join(' and ') :
                    'פרקי אבות - ' +
                    pa.map(s => Utils.toJNum(s) + ' פרק').join('ו'));
            }
        }
        if (jDay === 30) {
            const monthIndex = (jMonth === 12 && !isLeapYear) || jMonth === 13 ? 1 : jMonth + 1;
            list.push(!hebrew ? 'Rosh Chodesh ' + Utils.jMonthsEng[monthIndex] : 'ראש חודש ' + Utils.jMonthsHeb[monthIndex]);
        } else if (jDay === 1 && jMonth != 7) {
            list.push(!hebrew ? 'Rosh Chodesh ' + Utils.jMonthsEng[jMonth] : 'ראש חודש ' + Utils.jMonthsHeb[jMonth]);
        }
        //V'sain Tal U'Matar in Chutz La'aretz is according to the secular date
        if (dayOfWeek !== 6 && (!israel) && secDate.getMonth() === 11) {
            const sday = secDate.getDate();
            //The three possible dates for starting vt"u are the 5th, 6th and 7th of December
            if (has(sday, 5, 6, 7)) {
                const nextYearIsLeap = jDate.isJdLeapY(jYear + 1);
                //If next year is not a leap year, then vst"u starts on the 5th.
                //If next year is a leap year than vst"u starts on the 6th.
                //If the 5th or 6th were shabbos than vst"u starts on Sunday.
                if ((((sday === 5 || (sday === 6 && dayOfWeek === 0)) && (!nextYearIsLeap))) ||
                    ((sday === 6 || (sday === 7 && dayOfWeek === 0)) && nextYearIsLeap))
                    list.push(!hebrew ? 'V\'sain Tal U\'Matar' : 'ותן טל ומטר');
            }
        }
        switch (jMonth) {
            case 1: //Nissan
                if (jDay === 12 && dayOfWeek === 4)
                    list.push(!hebrew ? 'Bedikas Chametz' : 'בדיקת חמץ');
                else if (jDay === 13 && dayOfWeek !== 5)
                    list.push(!hebrew ? 'Bedikas Chametz' : 'בדיקת חמץ');
                else if (jDay === 14)
                    list.push(!hebrew ? 'Erev Pesach' : 'ערב פסח');
                else if (jDay === 15)
                    list.push(!hebrew ? 'First Day of Pesach' : 'פסח - יום ראשון');
                else if (jDay === 16)
                    list.push(israel ?
                        (!hebrew ? 'Pesach - Chol HaMoed' : 'פסח - חול המועד') :
                        (!hebrew ? 'Pesach - Second Day' : 'פסח - יום שני'));
                else if (has(jDay, 17, 18, 19))
                    list.push(!hebrew ? 'Pesach - Chol Ha\'moed' : 'פסח - חול המועד');
                else if (jDay === 20)
                    list.push(!hebrew ? 'Pesach - Chol Ha\'moed - Erev Yomtov' : 'פסח - חול המועד - ערב יו"ט');
                else if (jDay === 21)
                    list.push(!hebrew ? '7th Day of Pesach' : 'שביעי של פסח');
                else if (jDay === 22 && !israel)
                    list.push(!hebrew ? 'Last Day of Pesach' : 'אחרון של פסח');
                break;
            case 2: //Iyar
                if (dayOfWeek === 1 && jDay > 2 && jDay < 12) {
                    list.push(!hebrew ? 'Baha"b' : 'תענית שני קמא');
                }
                else if (dayOfWeek === 4 && jDay > 5 && jDay < 13) {
                    list.push(!hebrew ? 'Baha"b' : 'תענית חמישי');
                }
                else if (dayOfWeek === 1 && jDay > 9 && jDay < 17) {
                    list.push(!hebrew ? 'Baha"b' : 'תענית שני בתרא');
                }
                if (jDay === 14)
                    list.push(!hebrew ? 'Pesach Sheini' : 'פסח שני');
                else if (jDay === 18)
                    list.push(!hebrew ? 'Lag BaOmer' : 'ל"ג בעומר');
                break;
            case 3: //Sivan
                if (jDay === 5)
                    list.push(!hebrew ? 'Erev Shavuos' : 'ערב שבועות');
                else if (jDay === 6)
                    list.push((israel ? (!hebrew ? 'Shavuos' : 'חג השבועות') :
                        (!hebrew ? 'Shavuos - First Day' : 'שבועות - יום ראשון')));
                if (jDay === 7 && !israel)
                    list.push(!hebrew ? 'Shavuos - Second Day' : 'שבועות - יום שני');
                break;
            case 4: //Tamuz
                if (jDay === 17 && dayOfWeek !== 6) {
                    list.push(!hebrew ? 'Fast - 17th of Tammuz' : 'צום י"ז בתמוז');
                }
                else if (jDay === 18 && dayOfWeek === 0) {
                    list.push(!hebrew ? 'Fast - 17th of Tammuz' : 'צום י"ז בתמוז');
                }
                break;
            case 5: //Av
                if (jDay === 9 && dayOfWeek !== 6)
                    list.push(!hebrew ? 'Tisha B\'Av' : 'תשעה באב');
                else if (jDay === 10 && dayOfWeek === 0)
                    list.push(!hebrew ? 'Tisha B\'Av' : 'תשעה באב');
                else if (jDay === 15)
                    list.push(!hebrew ? 'Tu B\'Av' : 'ט"ו באב');
                break;
            case 6: //Ellul
                if (dayOfWeek === 0 && has(jDay, 21, 22, 24, 26))
                    list.push(!hebrew ? 'Selichos' : 'מתחילים סליחות');
                else if (jDay === 29)
                    list.push(!hebrew ? 'Erev Rosh Hashana' : 'ערב ראש השנה');
                break;
            case 7: //Tishrei
                if (jDay === 1)
                    list.push(!hebrew ? 'Rosh Hashana - First Day' : 'ראש השנה');
                else if (jDay === 2)
                    list.push(!hebrew ? 'Rosh Hashana - Second Day' : 'ראש השנה');
                else if (jDay === 3 && dayOfWeek !== 6)
                    list.push(!hebrew ? 'Tzom Gedalia' : 'צום גדליה');
                else if (jDay === 4 && dayOfWeek === 0)
                    list.push(!hebrew ? 'Tzom Gedalia' : 'צום גדליה');
                else if (jDay === 9)
                    list.push(!hebrew ? 'Erev Yom Kippur' : 'ערב יום הכיפורים');
                else if (jDay === 10)
                    list.push(!hebrew ? 'Yom Kippur' : 'יום הכיפורים');
                else if (jDay === 14)
                    list.push(!hebrew ? 'Erev Sukkos' : 'ערב חג הסוכות');
                else if (jDay === 15)
                    list.push(!hebrew ? 'First Day of Sukkos' : 'חג הסוכות');
                else if (jDay === 16)
                    list.push(israel ?
                        (!hebrew ? 'Sukkos - Chol HaMoed' : 'סוכות - חול המועד') :
                        (!hebrew ? 'Sukkos - Second Day' : 'יום שני - חג הסוכות'));
                else if (has(jDay, 17, 18, 19, 20))
                    list.push(!hebrew ? 'Sukkos - Chol HaMoed' : 'סוכות - חול המועד');
                else if (jDay === 21)
                    list.push(!hebrew ? 'Hoshana Rabba - Erev Yomtov' : 'הושענא רבה - ערב יו"ט');
                else if (jDay === 22) {
                    list.push(!hebrew ? 'Shmini Atzeres' : 'שמיני עצרת');
                    if (israel)
                        list.push(!hebrew ? 'Simchas Torah' : 'שמחת תורה');
                }
                else if (jDay === 23 && !israel)
                    list.push(!hebrew ? 'Simchas Torah' : 'שמחת תורה');
                break;
            case 8: //Cheshvan
                if (dayOfWeek === 1 && jDay > 2 && jDay < 12) {
                    list.push(!hebrew ? 'Baha"b' : 'תענית שני קמא');
                }
                else if (dayOfWeek === 4 && jDay > 5 && jDay < 13) {
                    list.push(!hebrew ? 'Baha"b' : 'תענית חמישי');
                }
                else if (dayOfWeek === 1 && jDay > 9 && jDay < 17) {
                    list.push(!hebrew ? 'Baha"b' : 'תענית שני בתרא');
                }
                if (jDay === 7 && israel)
                    list.push(!hebrew ? 'V\'sain Tal U\'Matar' : 'ותן טל ומטר');
                break;
            case 9: //Kislev
                if (jDay === 25)
                    list.push(!hebrew ? 'Chanuka - One Candle' : '\'חנוכה - נר א');
                else if (jDay === 26)
                    list.push(!hebrew ? 'Chanuka - Two Candles' : '\'חנוכה - נר ב');
                else if (jDay === 27)
                    list.push(!hebrew ? 'Chanuka - Three Candles' : '\'חנוכה - נר ג');
                else if (jDay === 28)
                    list.push(!hebrew ? 'Chanuka - Four Candles' : '\'חנוכה - נר ד');
                else if (jDay === 29)
                    list.push(!hebrew ? 'Chanuka - Five Candles' : '\'חנוכה - נר ה');
                else if (jDay === 30)
                    list.push(!hebrew ? 'Chanuka - Six Candles' : '\'חנוכה - נר ו');
                break;
            case 10: //Teves
                if (jDate.isShortKislev(jYear)) {
                    if (jDay === 1)
                        list.push(!hebrew ? 'Chanuka - Six Candles' : '\'חנוכה - נר ו');
                    else if (jDay === 2)
                        list.push(!hebrew ? 'Chanuka - Seven Candles' : '\'חנוכה - נר ז');
                    else if (jDay === 3)
                        list.push(!hebrew ? 'Chanuka - Eight Candles' : '\'חנוכה - נר ח');
                }
                else {
                    if (jDay === 1)
                        list.push(!hebrew ? 'Chanuka - Seven Candles' : '\'חנוכה - נר ז');
                    else if (jDay === 2)
                        list.push(!hebrew ? 'Chanuka - Eight Candles' : '\'חנוכה - נר ח');
                }
                if (jDay === 10)
                    list.push(!hebrew ? 'Fast - 10th of Teves' : 'צום עשרה בטבת');
                break;
            case 11: //Shvat
                if (jDay === 15)
                    list.push(!hebrew ? 'Tu B\'Shvat' : 'ט"ו בשבט');
                break;
            case 12: //Both Adars
            case 13:
                if (jMonth === 12 && isLeapYear) { //Adar Rishon in a leap year
                    if (jDay === 14)
                        list.push(!hebrew ? 'Purim Katan' : 'פורים קטן');
                    else if (jDay === 15)
                        list.push(!hebrew ? 'Shushan Purim Katan' : 'שושן פורים קטן');
                }
                else { //The "real" Adar: the only one in a non-leap-year or Adar Sheini
                    if (jDay === 11 && dayOfWeek === 4)
                        list.push(!hebrew ? 'Fast - Taanis Esther' : 'תענית אסתר');
                    else if (jDay === 13 && dayOfWeek !== 6)
                        list.push(!hebrew ? 'Fast - Taanis Esther' : 'תענית אסתר');
                    else if (jDay === 14)
                        list.push(!hebrew ? 'Purim' : 'פורים');
                    else if (jDay === 15)
                        list.push(!hebrew ? 'Shushan Purim' : 'שושן פורים');
                }
                break;
        }
        //If it is during Sefiras Ha'omer
        if ((jMonth === 1 && jDay > 15) || jMonth === 2 || (jMonth === 3 && jDay < 6)) {
            const dayOfSefirah = jd.getDayOfOmer();
            if (dayOfSefirah > 0) {
                list.push(!hebrew ?
                    'Sefiras Ha\'omer - Day ' + dayOfSefirah.toString() :
                    'ספירת העומר - יום ' + dayOfSefirah.toString());
            }
        }

        return list;
    }
    /**
     * Gets a String with the name of a major holidays or fast
     */
    static getMajorHoliday(jd, israel, hebrew) {
        const jYear = jd.Year,
            jMonth = jd.Month,
            jDay = jd.Day,
            dayOfWeek = jd.getDayOfWeek(),
            isLeapYear = jDate.isJdLeapY(jYear);

        switch (jMonth) {
            case 1: //Nissan
                if (jDay >= 15 && jDay <= (israel ? 21 : 22))
                    return (!hebrew ? 'Pesach' : 'פסח');
                break;
            case 2: //Iyar
                if (jDay === 18)
                    return (!hebrew ? 'Lag BaOmer' : 'ל"ג בעומר');
                break;
            case 3: //Sivan
                if (jDay === 6 || ((!israel) && jDay === 7))
                    return (!hebrew ? 'Shavuos' : 'שבועות');
                break;
            case 4: //Tamuz
                if ((jDay === 17 && dayOfWeek !== 6) || (jDay === 18 && dayOfWeek === 0)) {
                    return (!hebrew ? '17 Tammuz' : 'י"ז בתמוז');
                }
                break;
            case 5: //Av
                if ((jDay === 9 && dayOfWeek !== 6) || (jDay === 10 && dayOfWeek === 0))
                    return (!hebrew ? 'Tisha B\'Av' : 'תשעה באב');
                break;
            case 7: //Tishrei
                if (jDay === 1 || jDay === 2)
                    return (!hebrew ? 'Rosh Hashana' : 'ראש השנה');
                else if ((jDay === 3 && dayOfWeek !== 6) || (jDay === 4 && dayOfWeek === 0))
                    return (!hebrew ? 'Tzom Gedalya' : 'צום גדליה');
                else if (jDay === 10)
                    return (!hebrew ? 'Yom Kippur' : 'יום כיפור');
                else if (jDay >= 15 && jDay <= 21)
                    return (!hebrew ? 'Sukkos' : 'סוכות');
                else if (jDay === 22) {
                    if (israel) {
                        return (!hebrew ? 'Simchas Torah' : 'שמחת תורה');
                    }
                    else {
                        return (!hebrew ? 'Shmini Atzeres' : 'שמיני עצרת');
                    }
                }
                else if (jDay === 23 && !israel)
                    return (!hebrew ? 'Simchas Torah' : 'שמחת תורה');
                break;
            case 9: //Kislev
                if (jDay >= 25)
                    return (!hebrew ? 'Chanuka' : 'חנוכה');
                break;
            case 10: //Teves
                if (jDay <= 2 || (jDay === 3 && jDate.isShortKislev(jYear)))
                    return (!hebrew ? 'Chanuka' : 'חנוכה');
                else if (jDay === 10)
                    return (!hebrew ? 'Asara B\'Teves' : 'י\' בטבת');
                break;
            case 12: //Both Adars
            case 13:
                //The "real" Adar: the only one in a non-leap-year or Adar Sheini
                if (jMonth === 13 || !isLeapYear) {
                    if ((jDay === 11 && dayOfWeek === 4) || (jDay === 13 && dayOfWeek !== 6))
                        return (!hebrew ? 'Taanis Esther' : 'תענית אסתר');
                    else if (jDay === 14 || jDay === 15)
                        return (!hebrew ? 'Purim' : 'פורים');
                }
                break;
        }
    }
}