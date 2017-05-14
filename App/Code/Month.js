import jDate from './JCal/jDate';
import Utils from './JCal/Utils';
import { NightDay } from './Chashavshavon/Onah';

/**
 * Represents a single Jewish or Secular Month
 * Is used to generate a calendar month view.
 */
export default class Month {
    /**
     * @param {jDate | Date} date
     * @param {AppData} appData
     */
    constructor(date, appData) {
        this.isJdate = date instanceof jDate;
        this.appData = appData;

        //Set the date to the first of the month.
        if (this.isJdate) {
            this.date = new jDate(date.Year, date.Month, 1);
        }
        else {
            this.date = date.setDate(1);
        }
        this.getSingleDay = this.getSingleDay.bind(this);
    }
    static toString(weeks, isJdate) {
        let txt = '',
            firstWeek = weeks[0],
            firstDay = firstWeek[firstWeek.findIndex(d => d)],
            firstJdate = firstDay.jdate,
            firstSdate = firstDay.sdate,
            lastWeek = weeks[weeks.length - 1],
            lastDay = lastWeek[6] || lastWeek[lastWeek.findIndex(d => !d) - 1],
            lastJdate = lastDay.jdate,
            lastSdate = lastDay.sdate;
        if (isJdate) {
            txt = Utils.jMonthsEng[firstJdate.Month] + ' ' +
                firstJdate.Year.toString() + ' / ' +
                Utils.sMonthsEng[firstSdate.getMonth()] +
                (firstSdate.getMonth() !== lastSdate.getMonth() ?
                    ' - ' + Utils.sMonthsEng[lastSdate.getMonth()] : '') +
                ' ' + lastSdate.getFullYear().toString();
        }
        else {
            txt = Utils.sMonthsEng[firstSdate.getMonth()] + ' ' +
                lastSdate.getFullYear().toString() +
                Utils.jMonthsEng[firstJdate.Month] + ' ' +
                (firstJdate.Month !== lastJdate.Month ?
                    ' - ' + Utils.jMonthsEng[lastJdate.Month] : '') +
                ' ' + lastJdate.Year.toString();
        }
        return txt;
    }
    /**
     * Gets a 2 dimentional array for all the days in the month grouped by week.
     * Format is [weeks][days] where days are each an object:
     * { jdate, sdate, hasEntryNight, hasEntryDay, hasProbNight, hasProbDay }
     */
    getAllDays() {
        return this.isJdate ?
            this.getAllDaysJdate() : this.getAllDaysSdate();
    }
    getSingleDay(date) {
        const jdate = (date instanceof jDate && date) || new jDate(date),
            sdate = (date instanceof Date && date) || date.getDate(),
            hasEntryNight = this.appData.EntryList.list.some(e =>
                e.date.Abs === jdate.Abs && e.nightDay === NightDay.Night),
            hasProbNight = this.appData.ProblemOnahs.some(po =>
                po.jdate.Abs === jdate.Abs && po.nightDay === NightDay.Night),
            hasEntryDay = this.appData.EntryList.list.some(e =>
                e.date.Abs === jdate.Abs && e.nightDay === NightDay.Day),
            hasProbDay = this.appData.ProblemOnahs.some(po =>
                po.jdate.Abs === jdate.Abs && po.nightDay === NightDay.Day);
        return {
            jdate,
            sdate,
            hasEntryNight,
            hasEntryDay,
            hasProbNight,
            hasProbDay
        };
    }
    getAllDaysJdate() {
        const daysInMonth = jDate.daysJMonth(this.date.Year, this.date.Month),
            weeks = [Array(7)];
        for (let day = 1; day <= daysInMonth; day++) {
            const jdate = new jDate(this.date.Year, this.date.Month, day),
                dow = jdate.DayOfWeek;
            weeks[weeks.length - 1][dow] = this.getSingleDay(jdate);
            if (dow === 6 && day < daysInMonth) {
                //We will need a new week for the following day.
                weeks.push(Array(7));
            }
        }
        return weeks;
    }
    getAllDaysSdate() {
        const weeks = [Array(7)],
            month = this.date.getMonth();
        for (let currDay = this.date;
            currDay.getMonth() === month;
            currDay = new Date(currDay.setDate(currDay.getDate() + 1))) {
            const dow = currDay.getDay();
            weeks[weeks.length - 1][dow] = this.getSingleDay(currDay);
            if (dow === 6) {
                //We will need a new week for the following day.
                weeks.push(Array(7));
            }
        }
        return weeks;
    }
    get prev() {
        if (this.isJdate) {
            return new Month(this.date.addMonths(-1), this.appData);
        }
        else {
            return new Month(this.date.setMonth(-1), this.appData);
        }
    }
    get next() {
        if (this.isJdate) {
            return new Month(this.date.addMonths(1), this.appData);
        }
        else {
            return new Month(this.date.setMonth(1), this.appData);
        }
    }
}