import { has, isNumber } from '../GeneralUtils';
import jDate from '../JCal/jDate';
import Entry from './Entry';
import Settings from '../Settings';
import { NightDay } from './Onah';
import ProblemOnah from './ProblemOnah';
import { KavuahTypes, Kavuah } from './Kavuah';

const today = new jDate();

export default class EntryList {
    constructor(settings, entryList) {
        this.list = entryList || [];
        this.settings = settings || new Settings();
        this.stopWarningDate = today.addMonths(this.settings.numberMonthsAheadToWarn);
    }
    /**
     * Add an Entry to the list.
     * In most cases, calulateHaflagas should be called after changing the list.
     * @param {*} e
     * @param {*} afterwards
     */
    add(e, afterwards) {
        if (!(e instanceof Entry)) {
            throw 'Only objects of type Entry can be added to the EntryList';
        }
        else {
            if (!this.list.some(entry => entry.isSameEntry(e))) {
                this.list.push(e);
                const index = this.list.indexOf(e);
                if (afterwards instanceof Function) {
                    afterwards(e, index);
                }
                return index;
            }
        }
    }
    /**
     * Remove the given entry from the list
     * In most cases, calulateHaflagas should be called after changing the list.
     * @param {*} arg - either the index of the Entry to remove or the actual Entry to remove.
     * Note: The suppled Entry does not have to refer to the same instance as the Entry in the list,
     * an entry where Entry.isSameEntry() returns true is removed.
     * @param {*} afterwards - the callback. Suppies the removed entry as an argument.
     */
    remove(arg, afterwards) {
        let wasRemoved = false,
            entry = null;
        if (isNumber(arg) && arg >= 0 && arg < this.list.length) {
            entry = this.list.splice(arg, 1);
            wasRemoved = true;
        }
        else if (arg instanceof Entry) {
            const index = this.list.findIndex(e => e === arg || e.isSameEntry(arg));
            if (index > -1) {
                entry = this.list.splice(index, 1);
                wasRemoved = true;
            }
        }
        else {
            throw 'EntryList.remove accepts either an Entry to remove or the index of the Entry to remove';
        }
        if (wasRemoved && afterwards instanceof Function) {
            afterwards(entry);
        }
    }
    /**
     * Returns whether or not the given Entry is in this list.
     * Note: The suppled Entry does not have to refer to the same actual instance as an Entry in the list;
     * an entry where isSameEntry returns true is also considered "found".
     * @param {*} Entry to test
     */
    contains(entry) {
        return !!~this.list.findIndex(e => e === entry || e.isSameEntry(entry));
    }
    /**
     * Returns the list of entries sorted chronologically reversed - the most recent first.
     */
    get descending() {
        //First assure the the list is sorted correctly.
        EntryList.sortEntries(this.list);
        //Clone the list, reverse it and return it. (cloning is because reverse is in-place)
        return this.list.slice().reverse();
    }
    /**
     * Returns the latest Entry
     */
    lastEntry() {
        let latest;
        for (let entry of this.list) {
            if (((!latest) || entry.date.Abs > latest.date.Abs)) {
                latest = entry;
            }
        }
        return latest;
    }
    /**
     * Returns the latest Entry that isn't set to ignore for Flagged Dates
     */
    lastRegularEntry() {
        let latest;
        for (let entry of this.list) {
            if ((!entry.ignoreForFlaggedDates) &&
                ((!latest) || entry.date.Abs > latest.date.Abs)) {
                latest = entry;
            }
        }
        return latest;
    }
    /**
     * Calculates the haflagas for all the entries in the list.
     */
    calulateHaflagas() {
        EntryList.sortEntries(this.list);
        for (let i = 0; i < this.list.length; i++) {
            const entry = this.list[i];
            if (i === 0) {
                entry.haflaga = 0;
            }
            else {
                const prev = this.list[i - 1];
                entry.haflaga = prev.date.diffDays(entry.date) + 1;
            }
        }
    }
    getProblemOnahs(kavuahList) {
        kavuahList = kavuahList && kavuahList.filter(k => k.active && !k.ignore);

        let probOnahs = [];
        const nonProbIgnoredList = EntryList.sortEntries(
            this.list.filter(e => !e.ignoreForFlaggedDates)),
            hasCancelKavuah = kavuahList && kavuahList.some(k => k.cancelsOnahBeinunis);

        //A list of Onahs that need to be kept. This first list is worked out from the list of Entries.
        //Problem Onahs are searched for from the date of each entry until the number of months specified in the
        //Property Setting "numberMonthsAheadToWarn"
        for (let entry of nonProbIgnoredList) {
            if (!hasCancelKavuah) {
                probOnahs = [
                    ...probOnahs,
                    ...this.getOnahBeinunisProblemOnahs(entry, nonProbIgnoredList)];
            }
            //Get problems generated by active Kavuahs
            probOnahs = [...probOnahs, ...this.getEntryDependentKavuahProblemOnahs(entry, kavuahList, nonProbIgnoredList)];
        }

        //Get the onahs that need to be kept for Kavuahs of yom hachodesh, sirug,
        //dilug (from projected day - not actual entry)
        //and other Kavuahs that are not dependent on the actual entry list
        probOnahs = [...probOnahs, ...this.getIndependentKavuahProblemOnahs(kavuahList, nonProbIgnoredList)];

        //Sort problem onahs by chronological order
        probOnahs.sort((a, b) => {
            if (a.jdate.Abs < b.jdate.Abs) {
                return -1;
            }
            else if (a.jdate.Abs > b.jdate.Abs) {
                return 1;
            }
            else {
                return a.nightDay - b.nightDay;
            }
        });

        return probOnahs;
    }
    getOnahBeinunisProblemOnahs(entry, nonProbIgnoredList) {
        const onahs = [];
        //Day Thirty ***************************************************************
        const dayThirty = entry.date.addDays(29);
        if (!EntryList.hasCloseEntry(dayThirty, entry.nightDay, nonProbIgnoredList)) {
            const thirty = new ProblemOnah(
                dayThirty,
                entry.nightDay,
                'Thirtieth Day' +
                (dayThirty.Day === entry.day ? ' and Yom HaChodesh' : ''));
            onahs.push(thirty);
            this.add24HourOnah(thirty, onahs);
            this.addOhrZarua(thirty, onahs);
        }

        //Day Thirty One ***************************************************************
        const dayThirtyOne = dayThirty.addDays(1);
        //Even if Settings.keepThirtyOne is false, the 31st day may be the Yom HaChodesh.
        if (dayThirtyOne.Day === entry.day || this.settings.keepThirtyOne) {
            let text = dayThirtyOne.Day === entry.day ? 'Yom HaChodesh' : '';
            if (this.settings.keepThirtyOne) {
                text += (text ? ' and ' : '') + 'Thirty First Day';
            }
            if (!EntryList.hasCloseEntry(dayThirtyOne, entry.nightDay, nonProbIgnoredList)) {
                const thirtyOne = new ProblemOnah(
                    dayThirtyOne,
                    entry.nightDay,
                    text);
                onahs.push(thirtyOne);
                this.add24HourOnah(thirtyOne, onahs);
                this.addOhrZarua(thirtyOne, onahs);
            }
        }

        //Haflagah **********************************************************************
        const haflagaDate = entry.date.addDays(entry.haflaga - 1);
        if (entry.haflaga > 0 && !EntryList.hasCloseEntry(haflagaDate, entry.nightDay, nonProbIgnoredList)) {
            const haflaga = new ProblemOnah(
                haflagaDate,
                entry.nightDay,
                `Yom Haflagah (${entry.haflaga.toString()})`);
            onahs.push(haflaga);
            this.addOhrZarua(haflaga, onahs);
        }

        //The Taz
        if (this.settings.keepLongerHaflagah) {
            //Go through all earlier entries in the list that have a longer haflaga than this one
            for (let e of nonProbIgnoredList.filter(en =>
                en.date.Abs < entry.date.Abs && en.haflaga > entry.haflaga)) {
                //See if their haflaga was never surpassed by an Entry after them
                if (!nonProbIgnoredList.some(oe =>
                    oe.date.Abs > e.date.Abs &&
                    oe.haflaga > e.haflaga)) {
                    const haflagaDate = entry.date.addDays(e.haflaga - 1);
                    if (!EntryList.hasCloseEntry(haflagaDate, entry.nightDay, nonProbIgnoredList)) {
                        let nonOverrided = new ProblemOnah(
                            haflagaDate,
                            entry.nightDay,
                            'Yom Haflaga (' + e.haflaga.toString() + ') which was never overided');
                        onahs.push(nonOverrided);
                        this.addOhrZarua(nonOverrided, onahs);
                    }
                }
            }
        }

        return onahs;
    }
    getEntryDependentKavuahProblemOnahs(entry, kavuahList, nonProbIgnoredList) {
        const onahs = [];

        //Kavuah Haflagah - with or without Maayan Pasuach
        for (let kavuah of kavuahList.filter(k =>
            (k.kavuahType === KavuahTypes.Haflagah || k.kavuahType === KavuahTypes.HaflagaMaayanPasuach))) {
            const haflagaDate = entry.date.addDays(kavuah.settingEntry.haflaga - 1);
            if (!EntryList.hasCloseEntry(haflagaDate, kavuah.settingEntry.nightDay, nonProbIgnoredList)) {
                const kavuahHaflaga = new ProblemOnah(
                    haflagaDate,
                    kavuah.settingEntry.nightDay,
                    'Kavuah of ' + kavuah.toString());
                onahs.push(kavuahHaflaga);
                this.addOhrZarua(kavuahHaflaga, onahs);
            }
        }

        if (this.settings.CheshbonKavuahByActualEntry) {
            //Kavuah of Dilug Haflaga
            for (let kavuah of kavuahList.filter(k =>
                k.kavuahType === KavuahTypes.DilugHaflaga && k.active)) {
                const settingEntry = kavuah.settingEntry,
                    //the number of entries from the setting entry until this one
                    numberEntry = nonProbIgnoredList.indexOf(entry) - nonProbIgnoredList.indexOf(settingEntry);
                if (numberEntry > 0) {
                    //add the dilug number for each entry to the original haflaga
                    const haflaga = settingEntry.haflaga + (kavuah.specialNumber * numberEntry);
                    //If haflaga is 0, there is no point...
                    if (haflaga) {
                        const haflagaDate = entry.date.addDays(haflaga - 1);
                        if (!EntryList.hasCloseEntry(haflagaDate, kavuah.settingEntry.nightDay, nonProbIgnoredList)) {
                            const kavuahDilugHaflaga = new ProblemOnah(
                                haflagaDate,
                                kavuah.settingEntry.nightDay,
                                'Kavuah of ' + kavuah.toString());
                            onahs.push(kavuahDilugHaflaga);
                            this.addOhrZarua(kavuahDilugHaflaga, onahs);
                        }
                    }
                }
            }

            //TODO: Does Dilug of Yom Hachodesh continue from an actual entry even if it is off cheshbon? For ex. 35, 34, 33, 36 - is the next "35" or just continues theoretically 32, 31....
            //Kavvuah Dilug Yom Hachodesh - even if one was off, only works out from entry not from what was supposed to be.
            //We cheshbon both.
            //The theoretical ones, are worked out in the function "GetIndependentKavuahOnahs"
            for (let kavuah of kavuahList.filter(k => k.kavuahType === KavuahTypes.DilugDayOfMonth && k.active)) {
                const date = entry.date.addMonths(1).addDays(kavuah.specialNumber);
                if (!EntryList.hasCloseEntry(date, kavuah.settingEntry.nightDay, nonProbIgnoredList)) {
                    const kavuahDilugDayofMonth = new ProblemOnah(
                        date,
                        kavuah.settingEntry.nightDay,
                        'Kavuah for ' + kavuah.toString());
                    onahs.push(kavuahDilugDayofMonth);
                    this.addOhrZarua(kavuahDilugDayofMonth, onahs);
                }
            }
        }

        return onahs;
    }
    getIndependentKavuahProblemOnahs(kavuahList, nonProbIgnoredList) {
        const onahs = [];

        //Kavuahs of Yom Hachodesh and Sirug
        for (let kavuah of kavuahList.filter(k =>
            has(k.kavuahType, KavuahTypes.DayOfMonth, KavuahTypes.DayOfMonthMaayanPasuach, KavuahTypes.Sirug))) {
            let dt = kavuah.settingEntry.date.addMonths(
                kavuah.kavuahType === KavuahTypes.Sirug ? kavuah.specialNumber : 1);
            while (dt.Abs <= this.stopWarningDate.Abs) {
                if (!EntryList.hasCloseEntry(dt, kavuah.settingEntry.nightDay, nonProbIgnoredList)) {
                    const o = new ProblemOnah(dt, kavuah.settingEntry.nightDay,
                        'Kavuah for ' + kavuah.toString());
                    onahs.push(o);
                    this.addOhrZarua(o, onahs);
                }

                dt = dt.addMonths(kavuah.kavuahType === KavuahTypes.Sirug ? kavuah.specialNumber : 1);
            }
        }
        //Kavuahs of "Day of week" - cheshboned from the theoretical Entries
        for (let kavuah of kavuahList.filter(k => k.kavuahType === KavuahTypes.DayOfWeek)) {
            let dt = kavuah.settingEntry.date.addDays(kavuah.specialNumber);
            while (dt.Abs <= this.stopWarningDate.Abs) {
                if (!EntryList.hasCloseEntry(dt, kavuah.settingEntry.nightDay, nonProbIgnoredList)) {
                    const o = new ProblemOnah(
                        dt,
                        kavuah.settingEntry.nightDay,
                        'Kavuah for ' + kavuah.ToString());
                    onahs.push(o);
                    this.addOhrZarua(o, onahs);
                }

                dt = dt.addDays(kavuah.specialNumber);
            }
        }
        if (this.settings.cheshbonKavuahByCheshbon) {
            //Kavuahs of Yom Hachodesh of Dilug - cheshboned from the theoretical Entries
            for (let kavuah of kavuahList.filter(k => k.kavuahType === KavuahTypes.DilugDayOfMonth)) {
                let nextMonth = kavuah.settingEntry.date.addMonths(1);
                for (let i = 1; ; i++) {
                    //Add the correct number of dilug days
                    const addDilugDays = nextMonth.addDays(kavuah.specialNumberNumber * i);
                    //We stop when we get to the beginning or end of the month
                    if (addDilugDays.Month !== nextMonth.Month ||
                        addDilugDays.Abs > this.stopWarningDate.Abs) {
                        break;
                    }
                    if (!EntryList.hasCloseEntry(addDilugDays, kavuah.settingEntry.nightDay, nonProbIgnoredList)) {
                        const o = new ProblemOnah(
                            addDilugDays,
                            kavuah.settingEntry.nightDay,
                            'Kavuah for ' + kavuah.toString());
                        onahs.push(o);
                        this.addOhrZarua(o, onahs);
                    }

                    nextMonth = nextMonth.addMonths(1);
                }
            }
            //Kavuahs of Yom Haflaga of Dilug - cheshboned from the theoretical Entries
            for (let kavuah of kavuahList.filter(k => k.kavuahType === KavuahTypes.DilugHaflaga)) {
                let dt = kavuah.settingEntry.date;
                for (let i = 1; ; i++) {
                    const nextHaflaga = kavuah.settingEntry.haflaga + (kavuah.specialNumber * i);
                    //For negative dilugim, we stop when we get to 0
                    if (nextHaflaga < 1) {
                        break;
                    }
                    dt = dt.addDays(nextHaflaga - 1);
                    if (dt.Abs > this.stopWarningDate.Abs) {
                        break;
                    }
                    if (!EntryList.hasCloseEntry(dt, kavuah.settingEntry.nightDay, nonProbIgnoredList)) {
                        const o = new ProblemOnah(
                            dt,
                            kavuah.settingEntry.nightDay,
                            'Kavuah by theoretical calculation for ' + kavuah.ToString());
                        onahs.push(o);
                        this.addOhrZarua(o, onahs);
                    }
                }
            }
        }

        return onahs;
    }
    add24HourOnah(probOnah, probList) {
        if (this.settings.onahBeinunis24Hours) {
            probList.push(new ProblemOnah(
                probOnah.jdate,
                probOnah.nightDay === NightDay.Day ? NightDay.Night : NightDay.Day,
                probOnah.name));
        }
    }
    addOhrZarua(probOnah, probList) {
        //If the user wants to see keep the Ohr Zarua  - the previous onah
        if (this.settings.showOhrZeruah) {
            const ohrZarua = probOnah.previous;
            probList.push(new ProblemOnah(
                ohrZarua.jdate,
                ohrZarua.nightDay,
                'Ohr Zarua of the ' + probOnah.name));
        }
    }
    getKavuahSuggestions() {
        return Kavuah.getKavuahSuggestionList(this.list);
    }
    /**
     * Sorts the given list of Entries chronologically.
     * This is nessesary in order to calculate the haflagas etc. correctly.
     * @param {[Entry]} list
     */
    static sortEntries(list) {
        return list.sort((a, b) => {
            if (a.date.Abs < b.date.Abs) {
                return -1;
            }
            else if (a.date.Abs > b.date.Abs) {
                return 1;
            }
            else {
                return a.nightDay - b.nightDay;
            }
        });
    }

    /**
     * Returns true if there was an Entry in the 11 days before the given onah.
     * This is to prevent flagging problems during the days where it is irrelavent.
     * @param {jDate} date
     * @param {NightDay} nightDay
     * @param {[Entry]} entries
     */
    static hasCloseEntry(date, nightDay, entries) {
        return entries.some(en =>
            en.date.Abs >= (date.Abs - 11) &&
            (en.date.Abs < date.Abs || (en.date.Abs === date.Abs && en.nightDay < nightDay))
        );
    }
}