import Onah from './Onah';
import NightDay from './NightDay';
import JDate from '../JCal/jDate';
import DataUtils from '../Data/DataUtils';

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
    get isInDatabase() {
        return !!this.entryId;
    }
    async toDatabase() {
        if (this.isInDatabase) {
            await DataUtils.executeSql(`UPDATE entries SET dateAbs=?, day=?, haflaga=? WHERE entryId=?`,
                [this.date.Abs, this.nightDay === NightDay.Day, this.haflaga, this.entryId])
                .then(() => {
                    console.log(`Updated Entry Id ${this.entryId.toString()}`);
                })
                .catch(error => {
                    console.warn(`Error trying to update entry id ${this.entryId.toString()} to the database.`);
                    console.error(error);
                });
        }
        else {
            await DataUtils.executeSql(`INSERT INTO entries (dateAbs, day, haflaga) VALUES (?, ?, ?);SELECT last_insert_rowid() AS entryId FROM entries;`,
                [this.date.Abs, this.nightDay === NightDay.Day, this.haflaga])
                .then(results => {
                    if (results.length > 0) {
                        this.entryId = results[0].entryId;
                    }
                    else {
                        console.warn(`Entry Id was not returned from the database.`);
                    }
                })
                .catch(error => {
                    console.warn(`Error trying to insert entry into the database.`);
                    console.error(error);
                });
        }
    }
    static async fromDatabase(entryId) {
        let entry;
        if (!entryId) {
            throw 'entryId is missing';
        }
        await DataUtils.executeSql(`SELECT * from entries WHERE entryId=?`, [entryId])
            .then(results => {
                if (results.length > 0) {
                    const e = results[0];
                    entry = new Entry(new Onah(new JDate(e.dateAb), (e.day ? NightDay.Day : NightDay.Night)),
                        e.haflaga);
                }
                else {
                    console.warn(`Entry Id ${entryId.toString()} was not found in the database.`);
                }
            })
            .catch(error => {
                console.warn(`Error trying to get entry id ${entryId.toString()} from the database.`);
                console.error(error);
            });
        return entry;
    }
}