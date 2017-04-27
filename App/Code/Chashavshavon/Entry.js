import { NightDay } from './Onah';
import Utils from '../JCal/Utils';

export default class Entry {
    /**
     * A single sighting/period.
     * @param {Onah} onah - the onah of this entry
     * @param {Number} entryId - the entryId
     * @param {Number} haflaga - The haflaga between this entry and the previous one.
     */
    constructor(onah, entryId, haflaga) {
        this.onah = onah;
        this.entryId = entryId;
        this.haflaga = haflaga;
    }
    /**
     * Returns true if the supplied Entry has the same jdate and nightDay as this Entry.
     * The application assumes that there can not be more than a single Entry per Onah.
     * @param {Entry} entry
     */
    isSameEntry(entry) {
        return this.onah.isSameOnah(entry.onah);
    }
    toString() {
        let str = `${this.nightDay === NightDay.Night ? 'Night-time' : 'Day-time'} of ${this.date.toShortString()}`;
        if (this.haflaga) {
            str += ` [Haflaga of ${this.haflaga.toString()}]`;
        }
        return str;
    }
    toLongString() {
        let str = (this.nightDay === NightDay.Night ? 'Night-time' : 'Day-time') +
            ' of ' + this.date.toString() + ' - ' + Utils.toStringDate(this.date.getDate(), true, true);
        if (this.haflaga) {
            str += ` [Haflaga of ${this.haflaga.toString()}]`;
        }
        return str;
    }
    toKnownDateString() {
        let str = `Entry for ${this.nightDay === NightDay.Night ? 'Night-time' : 'Day-time'}`;
        if (this.haflaga) {
            str += ` [Haflaga of ${this.haflaga.toString()}]`;
        }
        return str;
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