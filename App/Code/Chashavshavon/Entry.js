import Onah from './Onah';
import NightDay from './NightDay';
import JDate from '../JCal/jDate';

export default class Entry {
    constructor(onah, haflaga, entryId) {
        this.onah = onah;
        if (haflaga instanceof Entry) {
            //If the previous entry was supplied as the haflaga argument
            this.haflaga = haflaga.onah.jdate.diffDays(this.onah.jdate) + 1;
        }
        else {
            this.haflaga = haflaga;
        }
        this.entryId = entryId;
    }
    isSameEntry(entry) {
        return this.onah.isSameOnah(entry.Onah) &&
            this.haflaga === entry.haflaga
    }
    toString() {
        return `The ${this.nightDay === NightDay.Night ? 'night' : 'day'} of ${this.date.toString()} [Haflaga of ${this.haflaga.toString()}]`;
    }
    get nightDay() {
        return this.onah.nightDay;
    }
    get date() {
        return this.onah.jdate;
    }
    get day() {
        return this.date.Day;
    }
    get month() {
        return this.date.Month;
    }
    get year() {
        return this.date.Year;
    }
    get dayOfWeek() {
        return this.date.DayOfWeek;
    }
    get hasId() {
        return !!this.entryId;
    }
}