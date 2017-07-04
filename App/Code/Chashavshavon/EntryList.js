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
        //Sort the list by date, clone it, reverse it and return it.
        //Cloning is because reverse is in-place.
        return [...EntryList.sortEntries(this.list)].reverse();
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
        const list = EntryList.sortEntries(this.list);
        for (let entry of list) {
            const index = list.indexOf(entry);
            //First Entry in the list does not have a Haflaga
            entry.setHaflaga((index > 0) && list[index - 1]);
        }
    }
    getProblemOnahs(kavuahList) {
        kavuahList = kavuahList && kavuahList.filter(k => k.active && !k.ignore);

        let probOnahs = [];
        const nonProbIgnoredList = EntryList.sortEntries(
            this.list.filter(e => !e.ignoreForFlaggedDates)),
            cancelKavuah = kavuahList && kavuahList.find(k => k.active && k.cancelsOnahBeinunis);

        //A list of Onahs that need to be kept. This first list is worked out from the list of Entries.
        //Problem Onahs are searched for from the date of each entry until the number of months specified in the
        //Property Setting "numberMonthsAheadToWarn"
        for (let entry of nonProbIgnoredList) {
            probOnahs = [
                ...probOnahs,
                ...this.getOnahBeinunisProblemOnahs(entry, nonProbIgnoredList, cancelKavuah)];
            //Get problems generated by active Kavuahs
            probOnahs = [...probOnahs, ...this.getEntryDependentKavuahProblemOnahs(entry, kavuahList, nonProbIgnoredList)];
        }

        //Get the onahs that need to be kept for Kavuahs of yom hachodesh, sirug,
        //and other Kavuahs that are not dependent on the actual entry list
        probOnahs = [...probOnahs, ...this.getIndependentKavuahProblemOnahs(kavuahList, nonProbIgnoredList)];

        //Combine and sort problem list and return it
        return EntryList.combineProbList(probOnahs);
    }
    getOnahBeinunisProblemOnahs(entry, nonProbIgnoredList, cancelKavuah) {
        const onahs = [];
        //Day Thirty ***************************************************************
        const dayThirty = entry.date.addDays(29);
        if (this.canAddFlaggedDate(dayThirty, entry.nightDay, nonProbIgnoredList) &&
            (!EntryList.isAfterKavuahStart(dayThirty, entry.nightDay, cancelKavuah))) {
            const thirty = new ProblemOnah(
                dayThirty,
                entry.nightDay,
                'Thirtieth Day' +
                (dayThirty.Day === entry.day ? ' and Yom HaChodesh' : ''));
            onahs.push(thirty);
            this.add24HourOnah(thirty, onahs);
            //We won't flag the Ohr Zarua if it's included in Onah Beinonis
            //of 24 hours as Onah Beinonis is stricter.
            if ((!this.settings.onahBeinunis24Hours) || entry.nightDay === NightDay.Day) {
                this.addOhrZarua(thirty, onahs);
            }
        }

        //Day Thirty One ***************************************************************
        const dayThirtyOne = dayThirty.addDays(1);
        //Even if Settings.keepThirtyOne is false, the 31st day may be the Yom HaChodesh.
        if (dayThirtyOne.Day === entry.day || this.settings.keepThirtyOne) {
            let text = dayThirtyOne.Day === entry.day ? 'Yom HaChodesh' : '';
            if (this.settings.keepThirtyOne) {
                text += (text ? ' and ' : '') + 'Thirty First Day';
            }
            if (this.canAddFlaggedDate(dayThirtyOne, entry.nightDay, nonProbIgnoredList) &&
                (!EntryList.isAfterKavuahStart(dayThirtyOne, entry.nightDay, cancelKavuah))) {
                const thirtyOne = new ProblemOnah(
                    dayThirtyOne,
                    entry.nightDay,
                    text);
                onahs.push(thirtyOne);
                this.add24HourOnah(thirtyOne, onahs);
                //We won't flag the Ohr Zarua if it's included in Onah Beinonis
                //of 24 hours as Onah Beinonis is stricter.
                if ((!this.settings.onahBeinunis24Hours) || entry.nightDay === NightDay.Day) {
                    this.addOhrZarua(thirtyOne, onahs);
                }
            }
        }

        //Haflagah **********************************************************************
        const haflagaDate = entry.date.addDays(entry.haflaga - 1);
        if ((entry.haflaga > 0) &&
            this.canAddFlaggedDate(haflagaDate, entry.nightDay, nonProbIgnoredList) &&
            (!EntryList.isAfterKavuahStart(haflagaDate, entry.nightDay, cancelKavuah))) {
            const haflaga = new ProblemOnah(
                haflagaDate,
                entry.nightDay,
                `Yom Haflagah (${entry.haflaga.toString()})`);
            onahs.push(haflaga);
            this.addOhrZarua(haflaga, onahs);
        }

        //The Ta"z
        if (this.settings.keepLongerHaflagah) {
            //Go through all earlier entries in the list that have a longer haflaga than this one
            for (let e of nonProbIgnoredList.filter(en =>
                en.date.Abs < entry.date.Abs && en.haflaga > entry.haflaga)) {
                //See if their haflaga was never surpassed by an Entry after them
                if (!nonProbIgnoredList.some(oe =>
                    oe.date.Abs > e.date.Abs &&
                    oe.haflaga > e.haflaga)) {
                    const haflagaDate = entry.date.addDays(e.haflaga - 1);
                    if (this.canAddFlaggedDate(haflagaDate, entry.nightDay, nonProbIgnoredList) &&
                        (!EntryList.isAfterKavuahStart(haflagaDate, entry.nightDay, cancelKavuah))) {
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
            if (this.canAddFlaggedDate(haflagaDate, kavuah.settingEntry.nightDay, nonProbIgnoredList)) {
                const kavuahHaflaga = new ProblemOnah(
                    haflagaDate,
                    kavuah.settingEntry.nightDay,
                    'Kavuah of ' + kavuah.toString());
                onahs.push(kavuahHaflaga);
                this.addOhrZarua(kavuahHaflaga, onahs);
            }
        }

        //Kavuah of Dilug Haflaga.
        //They are cheshboned from actual entries - not theoretical ones
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
                    if (this.canAddFlaggedDate(haflagaDate, kavuah.settingEntry.nightDay, nonProbIgnoredList)) {
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
        //Flagged Dates generated by Kavuahs of Haflagah by Onahs - the Shulchan Aruch Harav
        for (let kavuah of kavuahList.filter(k =>
            (k.kavuahType === KavuahTypes.HafalagaOnahs))) {
            const haflagaOnah = entry.onah.addOnahs(kavuah.specialNumber);
            if (this.canAddFlaggedDate(haflagaOnah.jdate, haflagaOnah.nightDay, nonProbIgnoredList)) {
                const kavuahHafOnahs = new ProblemOnah(
                    haflagaOnah.jdate,
                    haflagaOnah.nightDay,
                    'Kavuah of ' + kavuah.toString());
                onahs.push(kavuahHafOnahs);
                this.addOhrZarua(kavuahHafOnahs, onahs);
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
                if (this.canAddFlaggedDate(dt, kavuah.settingEntry.nightDay, nonProbIgnoredList)) {
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
                if (this.canAddFlaggedDate(dt, kavuah.settingEntry.nightDay, nonProbIgnoredList)) {
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
        //Kavuahs of Yom Hachodesh of Dilug - these are cheshboned from the theoretical Entries
        for (let kavuah of kavuahList.filter(k => k.kavuahType === KavuahTypes.DilugDayOfMonth)) {
            let nextMonth = kavuah.settingEntry.date.addMonths(1);
            for (let i = 1; ; i++) {
                //Add the correct number of dilug days
                const addDilugDays = nextMonth.addDays(kavuah.specialNumberNumber * i);
                //If set to stop when we get to the beginning or end of the month
                if ((this.settings.cheshbonKavuahByCheshbon && (addDilugDays.Month !== nextMonth.Month))
                    ||
                    addDilugDays.Abs > this.stopWarningDate.Abs) {
                    break;
                }
                if (this.canAddFlaggedDate(addDilugDays, kavuah.settingEntry.nightDay, nonProbIgnoredList)) {
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
     * Returns true if settings.noProbsAfterEntry is false or if there was no Entry in the 7 days before the given onah.
     * This is to prevent flagging problems during the days where it is irrelavent.
     * @param {jDate} date
     * @param {NightDay} nightDay
     * @param {[Entry]} nonProbIgnoredList
     */
    canAddFlaggedDate(date, nightDay, nonProbIgnoredList) {
        if (!this.settings.noProbsAfterEntry) {
            return true;
        }
        else {
            return !nonProbIgnoredList.some(en =>
                en.date.Abs >= (date.Abs - 7) &&
                (en.date.Abs < date.Abs || (en.date.Abs === date.Abs && en.nightDay < nightDay))
            );
        }
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
     * Returns true if the given date and NightDay are after the setting entry date
     * of the given Kavuah.
     * This is used to determine if a Problem Onah is after the setting entry of
     * a cancelling Kavuah in order to prevent its flagging.
     * @param {jDate} date
     * @param {NightDay} nightDay
     * @param {Kavuah} cancelKavuah
     */
    static isAfterKavuahStart(date, nightDay, kavuah) {
        if (kavuah) {
            const settingEntry = kavuah.settingEntry;
            return settingEntry && (
                (date.Abs > settingEntry.date.Abs) ||
                (date.Abs === settingEntry.date.Abs && nightDay > settingEntry.nightDay));
        }
    }
    /**
     * Combine and sort problems
     * @param {[ProblemOnah]} probList
     */
    static combineProbList(probList) {
        const fixedList = [];

        //Combine problems that are on the same Onah
        for (let prob of probList) {
            if (!fixedList.some(p => p.isSameOnah(prob))) {
                let name = prob.name +
                    probList
                        .filter(p => p !== prob && p.isSameOnah(prob))
                        .map(p => ' and ' + p.name);
                fixedList.push(new ProblemOnah(prob.jdate, prob.nightDay, name));
            }
        }

        //Sort problem onahs by chronological order, and return them
        return fixedList.sort((a, b) => {
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
    }
}