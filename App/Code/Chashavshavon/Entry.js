import { NightDay } from './Onah';
import Utils from '../JCal/Utils';

export default class Entry {
    /**
     * A single "ראייה" - period.
     * @param {Onah} onah Jewish date and Night/Day that the period began
     * @param {Number} entryId The entryId in the database
     * @param {Boolean} ignoreForFlaggedDates This is not a real period
     * @param {Boolean} ignoreForKavuah Ignore this Entry while calculating possible Kavuahs
     * @param {String} comment
     */
    constructor(
        onah,
        entryId,
        ignoreForFlaggedDates,
        ignoreForKavuah,
        comments
    ) {
        this.onah = onah;
        this.entryId = entryId;
        this.ignoreForFlaggedDates = !!ignoreForFlaggedDates;
        this.ignoreForKavuah = !!ignoreForKavuah;
        this.comments = comments;
        //Initial value only...
        this._haflaga = 0;
    }
    /**
     * Set the current entries haflaga
     * @param {Entry} previousEntry
     */
    setHaflaga(previousEntry) {
        this._haflaga = previousEntry
            ? previousEntry.date.diffDays(this.date) + 1
            : 0;
    }
    /**
     * Returns true if the supplied Entry has the same jdate and nightDay as this Entry.
     * There can not be more than a single Entry per Onah.
     * @param {Entry} entry
     */
    isSameEntry(entry) {
        return this.onah.isSameOnah(entry.onah);
    }
    /**
     * Get the onah differential between two entries.
     * The second onah must be chronologically after this Entrys onah.
     * @param {Entry} entry
     */
    getOnahDifferential(entry) {
        let count = this.date.diffDays(entry.date) * 2;
        if (this.nightDay < entry.nightDay) {
            count++;
        } else if (this.nightDay > entry.nightDay) {
            count--;
        }
        return count;
    }
    toString() {
        let str = `${
            this.nightDay === NightDay.Night ? 'Night-time' : 'Day-time'
        } of ${this.date.toShortString()}`;
        if (this.haflaga) {
            str += ` [Haflaga of ${this.haflaga.toString()}]`;
        }
        return str;
    }
    toShortString() {
        return (
            this.date.toShortString() +
            ' (' +
            (this.nightDay === NightDay.Night ? 'Night' : 'Day') +
            ')'
        );
    }
    toLongString() {
        let str = '';
        if (this.ignoreForFlaggedDates || this.ignoreForKavuah) {
            str += 'NON-REGULAR ENTRY\n';
        }
        str +=
            (this.nightDay === NightDay.Night ? 'Night-time' : 'Day-time') +
            ' of ' +
            this.date.toString() +
            ' - ' +
            Utils.toStringDate(this.date.getDate(), true, true);
        if (this.haflaga) {
            str += ` [Haflaga of ${this.haflaga.toString()}]`;
        }
        if (this.ignoreForFlaggedDates) {
            str += '\nThis Entry does not generate any flagged dates.';
        }
        if (this.ignoreForKavuah) {
            str +=
                '\nThis Entry is not considered while calculating possible Kavuahs.';
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
        str += `Entry for ${
            this.nightDay === NightDay.Night ? 'Night-time' : 'Day-time'
        }`;
        if (this.haflaga) {
            str += ` [Haflaga of ${this.haflaga.toString()}]`;
        }
        return str;
    }
    /**
     * Clone the current entry.
     */
    clone() {
        const entry = new Entry(
            this.onah,
            this.entryId,
            this.ignoreForFlaggedDates,
            this.ignoreForKavuah,
            this.comments
        );
        entry._haflaga = this.haflaga;
        return entry;
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
    get haflaga() {
        return this._haflaga;
    }
}
