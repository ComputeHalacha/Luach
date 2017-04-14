import Utils from '../JCal/Utils';
import NightDay from './NightDay';
import { setDefault } from '../GeneralUtils';

class KavuahType {
    static get Haflagah() { return 1; }
    static get DayOfMonth() { return 2; }
    static get DayOfWeek() { return 4; }
    static get Sirug() { return 8; }
    static get DilugHaflaga() { return 16; }
    static get DilugDayOfMonth() { return 32; }
    static get HaflagaMaayanPasuach() { return 64; }
    static get DayOfMonthMaayanPasuach() { return 128; }
}

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
        case KavuahType.Haflagah:
            txt += `every ${this.settingEntry.haflaga.toString()} days`;
            break;
        case KavuahType.DayOfMonth:
            txt = `the ${Utils.toSuffixed(this.settingEntry.day)} day of the Jewish Month`;
            break;
        case KavuahType.DayOfWeek:
            txt += `${Utils.dowEng[this.settingEntry.date.getDayOfWeek()]} every ${Utils.toSuffixed(this.specialNumber)} week`;
            break;
        case KavuahType.Sirug:
            txt += `the ${Utils.toSuffixed(this.settingEntry.day)} day of every ${Utils.toSuffixed(this.specialNumber)} month`;
            break;
        case KavuahType.HaflagaMaayanPasuach:
            txt += `every ${this.settingEntry.specialNumber.toString()} days (through Ma'ayan Pasuach)`;
            break;
        case KavuahType.DayOfMonthMaayanPasuach:
            txt += `the ${Utils.toSuffixed(this.specialNumber)} day of the Jewish Month (through Ma'ayan Pasuach)`;
            break;
        case KavuahType.DilugHaflaga:
            txt += `following the interval pattern of ${this.specialNumber < 0 ? '-' : '+'} ${Math.Abs(this.specialNumber).toString()} days`;
            break;
        case KavuahType.DilugDayOfMonth:
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
   //Works out all possible Kavuahs from the given list of entries
    static getKavuahSuggestionList(entryList) {
        let kavuahList = [];
        const queue = [];

        for (let entry of entryList) {
            //First we work out those Kavuahs that are not dependent on their entries being 3 in a row
            kavuahList = kavuahList.concat(Kavuah.getDayOfMonthKavuah(entry, entryList))
                .concat(Kavuah.getDilugDayOfMonthKavuah(entry, entryList))
                .concat(Kavuah.getDayOfWeekKavuahs(entry, entryList));

            //For cheshboning out all other Kavuahs, we use 3 entries in a row.
            //First, add the current entry of the loop.
            queue.push(entry);
            //if the queue is too "full"
            if (queue.length > 3) {
                //pop out the earliest one - leaves us with just this entry and the previous 2.
                queue.shift();
            }
            //We can't start cheshboning until we have 3 entries - all with the same nightDay
            if (queue.length === 3 &&
                queue[0].nightDay === queue[1].nightDay &&
                queue[1].nightDay === queue[2].nightDay) {

                kavuahList = kavuahList.concat(Kavuah.getHaflagahKavuah(queue))
                    .concat(Kavuah.getSirugKavuah(queue))
                    .concat(Kavuah.getDilugHaflagahKavuah(queue));
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
        if (entryList.some(en => en.onah.nightDay === entry.onah.nightDay && en.date.Abs === nextMonth.Abs)) {
            //Now we look for another entry that is exactly two Jewish months later
            const thirdFind = entryList.find(en =>
                en.onah.nightDay === entry.onah.nightDay && en.date.Abs === thirdMonth.Abs);
            if (thirdFind) {
                list.push(new Kavuah(KavuahType.DayOfMonth, thirdFind, thirdMonth.Day, true));
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
                list.push(new Kavuah(KavuahType.DilugDayOfMonth, finalFind, dilugDays, false));
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
                    list.push(new Kavuah(KavuahType.DayOfWeek, secondFind, interval, false));
                }
            }
        }
        return list;
    }
    static getHaflagahKavuah(threeEntries) {
        const list = [];
        //We simply compare the intervals between the entries. If they are the same, we have a Kavuah
        if ((threeEntries[0].haflaga === threeEntries[1].haflaga) &&
            (threeEntries[1].haflaga === threeEntries[2].haflaga)) {
            list.push(new Kavuah(KavuahType.Haflagah, threeEntries[2], threeEntries[2].haflaga, true));
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
            list.push(new Kavuah(KavuahType.Sirug, threeEntries[2], monthDiff, true));
        }
        return list;
    }
    static getDilugHaflagahKavuah(threeEntries) {
        // Cheshbon out Dilug Haflaga Kavuahs
        const list = [],
            //We check the three entries if their interval "Dilug"s are the same.
            haflagaDiff1 = threeEntries[2].haflaga - threeEntries[1].haflaga,
            haflagaDiff2 = threeEntries[1].haflaga - threeEntries[0].haflaga;

        //If the "Dilug" is 0 it will be a regular Kavuah of Haflagah but not a Dilug one
        if (haflagaDiff1 > 0 && haflagaDiff1 === haflagaDiff2) {
            list.push(new Kavuah(KavuahType.DilugHaflaga, threeEntries[2], haflagaDiff1, false));
        }
        return list;
    }
}

export {KavuahType, Kavuah};