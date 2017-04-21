import Utils from '../JCal/Utils';
import { NightDay } from './Onah';
import { setDefault } from '../GeneralUtils';

const KavuahTypes = Object.freeze({
    Haflagah: 1,
    DayOfMonth: 2,
    DayOfWeek: 4,
    Sirug: 8,
    DilugHaflaga: 16,
    DilugDayOfMonth: 32,
    HaflagaMaayanPasuach: 64,
    DayOfMonthMaayanPasuach: 128
});

class Kavuah {
    constructor(kavuaType, settingEntry, specialNumber, cancelsOnahBeinunis, active, ignore, kavuahId) {
        this.kavuaType = kavuaType;
        //The third entry  - the one that created the chazakah.
        this.settingEntry = settingEntry;
        /*Each type of Kavuah uses the specialNumber in its own way:
            Haflagah and DayOfMonth don't need to use it as the settingEntry has the values.
            DayOfWeek - the number of days beteween onahs
            Sirug -the number of months beteween onahs
            DilugHaflaga - number of days to increment (can be negative) number
            DilugDayOfMonth - number of days to increment (can be negative) number
            HaflagaMaayanPasuach and DayOfMonthMaayanPasuach the same as their regular couterparts. */
        this.specialNumber = specialNumber;
        //Does this Kavuah cancel the onah beinunis?
        this.cancelsOnahBeinunis = !!cancelsOnahBeinunis;
        this.active = setDefault(active, true);
        this.ignore = !!ignore;
        this.kavuahId = kavuahId;
    }
    toString() {
        let txt = this.settingEntry.nightDay === NightDay.Night ? 'Nighttime ' : 'Daytime ';
        switch (this.kavuaType) {
            case KavuahTypes.Haflagah:
                txt += `every ${this.settingEntry.haflaga.toString()} days`;
                break;
            case KavuahTypes.DayOfMonth:
                txt = `the ${Utils.toSuffixed(this.settingEntry.day)} day of the Jewish Month`;
                break;
            case KavuahTypes.DayOfWeek:
                txt += `${Utils.dowEng[this.settingEntry.date.getDayOfWeek()]} every ${Utils.toSuffixed(this.specialNumber)} week`;
                break;
            case KavuahTypes.Sirug:
                txt += `the ${Utils.toSuffixed(this.settingEntry.day)} day of every ${Utils.toSuffixed(this.specialNumber)} month`;
                break;
            case KavuahTypes.HaflagaMaayanPasuach:
                txt += `every ${this.settingEntry.specialNumber.toString()} days (through Ma'ayan Pasuach)`;
                break;
            case KavuahTypes.DayOfMonthMaayanPasuach:
                txt += `the ${Utils.toSuffixed(this.specialNumber)} day of the Jewish Month (through Ma'ayan Pasuach)`;
                break;
            case KavuahTypes.DilugHaflaga:
                txt += `following the interval pattern of ${this.specialNumber < 0 ? '-' : '+'} ${Math.Abs(this.specialNumber).toString()} days`;
                break;
            case KavuahTypes.DilugDayOfMonth:
                txt += `for days of the month following the interval pattern of ${this.specialNumber < 0 ? '-' : '+'} ${Math.Abs(this.specialNumber).toString()} days`;
                break;
        }
        if (!this.active) {
            txt += ' [INACTIVE]';
        }
        return txt;
    }
    isMatchingKavuah(kavuah) {
        return this.kavuaType === kavuah.kavuaType &&
            this.settingEntry.onah.isSameOnah(kavuah.settingEntry.onah) &&
            this.specialNumber === kavuah.specialNumber;
    }
    get hasId() {
        return !!this.kavuahId;
    }
    /**
     * Works out all possible Kavuahs from the given list of entries
     * Returns an array of objects, each containing:
     * {
     *      kavuah: the found Kavuah object
     *      entries: an array of the 3 or 4 Entry objects that were found to have a possible Kavuah relationship.
     * }
     * @param {*} entryList
     */
    static getKavuahSuggestionList(entryList) {
        let kavuahList = [];
        const queue = [];

        for (let entry of entryList) {
            //First we work out those Kavuahs that are not dependent on their entries being 3 in a row
            kavuahList = kavuahList.concat(Kavuah.getDayOfMonthKavuah(entry, entryList))
                .concat(Kavuah.getDilugDayOfMonthKavuah(entry, entryList))
                .concat(Kavuah.getDayOfWeekKavuahs(entry, entryList));

            //For cheshboning out all other Kavuahs, we use 3 or 4 entries in a row.
            //First, add the current entry of the loop.
            queue.push(entry);
            //if the queue is too "full"
            if (queue.length > 4) {
                //pop out the earliest one - leaves us with just this entry and the previous 3.
                queue.shift();
            }

            //To cheshbon the sirug kavuah we need 3 entries with the same night/day.
            if (queue.length >= 3 &&
                queue[0].nightDay === queue[1].nightDay &&
                queue[1].nightDay === queue[2].nightDay) {
                //We only need three entries for a sirug kavuah.
                //We always send the last 3 entries as the last one is always the newly added one.
                kavuahList = kavuahList
                    .concat(Kavuah.getSirugKavuah(queue.slice(-3)));

                //We can't start cheshboning haflaga kavuahs until we have 4 entries - all with the same nightDay
                if (queue.length === 4 &&
                    queue[2].nightDay === queue[3].nightDay) {
                    kavuahList = kavuahList
                        .concat(Kavuah.getHaflagahKavuah(queue))
                        .concat(Kavuah.getDilugHaflagahKavuah(queue));
                }
            }
        }
        return kavuahList;
    }
    static getDayOfMonthKavuah(entry, entryList) {
        const list = [],
            nextMonth = entry.date.addMonths(1),
            thirdMonth = nextMonth.addMonths(1);
        //We look for an entry that is exactly one Jewish month later
        //Note, it is irrelevant if there were other entries in the interim
        const secondFind = entryList.find(en =>
            en.onah.nightDay === entry.onah.nightDay && en.date.Abs === nextMonth.Abs);
        if (secondFind) {
            //Now we look for another entry that is exactly two Jewish months later
            const thirdFind = entryList.find(en =>
                en.onah.nightDay === entry.onah.nightDay && en.date.Abs === thirdMonth.Abs);
            if (thirdFind) {
                list.push({
                    kavuah: new Kavuah(KavuahTypes.DayOfMonth, thirdFind, thirdMonth.Day, true),
                    entries: [entry, secondFind, thirdFind]
                });
            }
        }
        return list;
    }
    static getDilugDayOfMonthKavuah(entry, entryList) {
        const list = [];
        //First, we look for any entry that is in the next Jewish month after the given entry -
        //but not on the same day as that would be a regular DayOfMonth Kavuah with no Dilug.
        //Note, it is irrelevant if there were other entries in the interim
        const nextMonth = entry.date.addMonths(1),
            secondFind = entryList.find(en =>
                en.nightDay === entry.nightDay &&
                nextMonth.Day !== en.day &&
                nextMonth.Month === en.month &&
                nextMonth.Year === en.year);
        if (secondFind) {
            //Now we look for another entry that is in the 3rd month and has the same "Dilug" as the previous find
            const thirdMonth = entry.date.addMonths(2),
                dilugDays = secondFind.day - entry.day,
                finalFind = entryList.find(en =>
                    en.nightDay === entry.nightDay &&
                    (en.day - secondFind.day) === dilugDays &&
                    thirdMonth.Month === en.month &&
                    thirdMonth.Year === en.year);
            if (finalFind) {
                list.push({
                    kavuah: new Kavuah(KavuahTypes.DilugDayOfMonth, finalFind, dilugDays, false),
                    entries: [entry, secondFind, finalFind]
                });
            }
        }
        return list;
    }
    static getDayOfWeekKavuahs(entry, entryList) {
        const list = [];

        //We go through the proceeding entries in the list looking for those that are on the same day of the week as the given entry
        //Note, similar to Yom Hachodesh based kavuahs, it is irrelevant if there were other entries in the interim (משמרת הטהרה)
        for (let firstFind of entryList.filter(e =>
            e.nightDay === entry.nightDay &&
            e.date.Abs > entry.date.Abs &&
            e.dayOfWeek === entry.dayOfWeek)) {

            //We get the interval in days between the found entry and the given entry
            const interval = entry.date.diffDays(firstFind.date),
                nextDate = firstFind.date.addDays(interval);

            //If the next date has the same day of the week, we will check if there is an Entry on that day.
            if (entry.dayOfWeek === nextDate.DayOfWeek) {
                //We now look for a second entry that is also on the same day of the week
                //and that has the same interval from the previously found entry
                const secondFind = entryList.find(en =>
                    en.nightDay === entry.nightDay &&
                    en.date.Abs === nextDate.Abs);
                if (secondFind) {
                    list.push({
                        kavuah: new Kavuah(KavuahTypes.DayOfWeek, secondFind, interval, false),
                        entries: [entry, firstFind, secondFind]
                    });
                }
            }
        }
        return list;
    }
    static getHaflagahKavuah(fourEntries) {
        const list = [];
        //We simply compare the intervals between the entries. If they are the same, we have a Kavuah
        if ((fourEntries[1].haflaga === fourEntries[2].haflaga) &&
            (fourEntries[2].haflaga === fourEntries[3].haflaga)) {
            list.push({
                kavuah: new Kavuah(KavuahTypes.Haflagah, fourEntries[3], fourEntries[3].haflaga, true),
                entries: fourEntries
            });
        }
        return list;
    }
    static getSirugKavuah(threeEntries) {
        // Cheshbon out Kavuah of Sirug
        // We go here according to those that Sirug Kavuahs need 3 in a row with no intervening entries
        const list = [],
            //We get the difference in months between the first 2 entries
            monthDiff = threeEntries[0].date.diffMonths(threeEntries[1].date);
        //If the difference is 1, than it can not be a Sirug Kavuah - rather it may be a DayOfMonth kavuah.
        //We now check to see if the third Entry is the same number of months
        //after the second one, and that all 3 entries are on the same day of the month.
        if (monthDiff > 1 &&
            (threeEntries[0].day === threeEntries[1].day) &&
            (threeEntries[1].day === threeEntries[2].day) &&
            threeEntries[1].date.diffMonths(threeEntries[2].date) === monthDiff) {
            //Add the kavuah
            list.push({
                kavuah: new Kavuah(KavuahTypes.Sirug, threeEntries[2], monthDiff, true),
                entries: threeEntries
            });
        }
        return list;
    }
    static getDilugHaflagahKavuah(fourEntries) {
        // Cheshbon out Dilug Haflaga Kavuahs
        const list = [],
            //We check the three entries if their interval "Dilug"s are the same.
            haflagaDiff1 = fourEntries[3].haflaga - fourEntries[2].haflaga,
            haflagaDiff2 = fourEntries[2].haflaga - fourEntries[1].haflaga;

        //If the "Dilug" is 0 it will be a regular Kavuah of Haflagah but not a Dilug one
        if (haflagaDiff1 > 0 && haflagaDiff1 === haflagaDiff2) {
            list.push({
                kavuah: new Kavuah(KavuahTypes.DilugHaflaga, fourEntries[3], haflagaDiff1, false),
                entries: fourEntries
            });
        }
        return list;
    }
}

export { KavuahTypes, Kavuah };