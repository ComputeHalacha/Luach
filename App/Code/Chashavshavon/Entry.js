import Onah from './Onah.js';
export default class Entry {
    constructor(onah, haflaga, noKavuahList) {
        this.onah = onah;
        if (haflaga instanceof Entry) {
            //If the previous entry was supplied i the haflaga argument
            this.haflaga = haflaga.onah.jdate.diffDays(this.onah.jdate) + 1;
        }
        else {
            this.haflaga = haflaga;
        }
        //A list of kavuahs that are NOT to be flagged if this Entry is the potential settingEntry.
        this.noKavuahList = noKavuahList || [];
    }
    isSameEntry(entry) {
        return this.onah.isSameOnah(entry.Onah) &&
            this.haflaga === entry.haflaga
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
}