import { NightDay } from './Onah';
import Utils from '../JCal/Utils';

export default class Entry {
    /**
     * A single sighting/period.
     * @param {Onah} onah - the onah of this entry
     * @param {Number} entryId - the entryId
     * @param {Boolean} ignoreForFlaggedDates
     * @param {Boolean} ignoreForKavuah
     * @param {String} comment
     */
    constructor(onah, entryId, ignoreForFlaggedDates, ignoreForKavuah, comments) {
        this.onah = onah;
        this.entryId = entryId;
        this.ignoreForFlaggedDates = !!ignoreForFlaggedDates;
        this.ignoreForKavuah = !!ignoreForKavuah;
        this.comments = comments;
        //Initial value only...
        this.haflaga = 0;
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
    toShortString() {
        return this.date.toShortString() +
            ' (' +
            (this.nightDay === NightDay.Night ? 'Night' : 'Day') +
            ')';
    }
    toLongString() {
        let str = '';
        if (this.ignoreForFlaggedDates || this.ignoreForKavuah) {
            str += 'NON-REGULAR ENTRY\n';
        }
        str += (this.nightDay === NightDay.Night ? 'Night-time' : 'Day-time') +
            ' of ' + this.date.toString() + ' - ' + Utils.toStringDate(this.date.getDate(), true, true);
        if (this.haflaga) {
            str += ` [Haflaga of ${this.haflaga.toString()}]`;
        }
        if (this.ignoreForFlaggedDates) {
            str += '\nThis Entry does not generate any flagged dates.';
        }
        if (this.ignoreForKavuah) {
            str += '\nThis Entry is not considered while calculating possible Kavuahs.';
        }
        if (this.comments) {
            str += '\nComments: ' + this.comments;
        }
        return str;
    }
    toKnownDateString() {
        let str = '';
        if (this.ignoreForFlaggedDates || this.ignoreForKavuah) {
            str += 'NON-REGULAR ';
        }
        str += `Entry for ${this.nightDay === NightDay.Night ? 'Night-time' : 'Day-time'}`;
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
    get hefsekDate() {
        return this.date.addDays(4);
    }
    get hasId() {
        return !!this.entryId;
    }
}