import { has, isNumber } from '../GeneralUtils';
import jDate from '../JCal/jDate';
import Entry from './Entry';
import Settings from '../Settings';
import NightDay from './NightDay';
import ProblemOnah from './ProblemOnah';
import KavuahType from './KavuahType';
import Kavuah from './Kavuah';

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
     * @param {*} arg
     * @param {*} afterwards
     */
    remove(arg, afterwards) {
        let removed = false;
        if (isNumber(arg) && arg >= 0 && arg < this.list.length) {
            this.list.splice(arg, 1);
            removed = true;
        }
        else if (arg instanceof Entry) {
            const index = this.list.indexOf(arg);
            if (index > -1) {
                this.list.splice(index, 1);
                removed = true;
            }
        }
        else {
            throw 'EntryList.remove accepts either an Entry to remove or the index of the Entry to remove';
        }
        if (removed && afterwards instanceof Function) {
            afterwards();
        }
    }
    /**
     * Returns the list of entries sorted chronologically reversed - the most recent first.
     */
    get descending() {
        //First assure the the list is sorted correctly.
        this.sortList();
        //Clone the list, reverse it and return it. (cloning is because reverse is in-place)
        return this.list.slice().reverse();
    }
    /**
     * Sorts the list chronologically.
     * This is nessesary in order to calculate the haflagas correctly.
     */
    sortList() {
        this.list.sort((a, b) => {
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
     * Calculates the haflagas for all the entries in the list.
     */
    calulateHaflagas() {
        this.sortList();
        for (let i = 0; i < this.list.length; i++) {
            const entry = this.list[i];
            if (i === 0) {
                entry.haflaga = 0;
            }
            else {
                const prev = this.list[i - 1];
                entry.haflaga = prev.date.diffDays(entry.date) - 1;
            }
        }
    }
    getProblemOnahs(kavuahList) {
        let probOnahs = [];
        const cancelOnahBeinenis = kavuahList.some(k => k.active && k.cancelsOnahBeinunis);

        //A list of Onahs that need to be kept. This first list is worked out from the list of Entries.
        //Problem Onahs are searched for from the date of each entry until the number of months specified in the
        //Property Setting "numberMonthsAheadToWarn"
        for (let entry of this.list) {
            if (!cancelOnahBeinenis) {
                probOnahs = [...probOnahs, ...this.getOnahBeinunisProblemOnahs(entry)];
            }
            probOnahs = [...probOnahs, ...this.getEntryDependentKavuahProblemOnahs(entry, kavuahList)];
        }
        //Get the onahs that need to be kept for Kavuahs of yom hachodesh, sirug,
        //dilug (from projected day - not actual entry)
        //and other Kavuahs that are not dependent on the actual entry list
        probOnahs = [...probOnahs, ...this.getIndependentKavuahProblemOnahs(kavuahList)];

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
    getOnahBeinunisProblemOnahs(entry) {
        const onahs = [];

        //Day Thirty ***************************************************************
        const thirty = new ProblemOnah(
            entry.date.addDays(29),
            entry.nightDay,
            'Thirtieth Day');
        onahs.push(thirty);
        this.add24HourOnah(thirty, onahs);
        this.addOhrZarua(thirty, onahs);

        //Day Thirty One ***************************************************************
        const thirtyOne = new ProblemOnah(
            entry.date.addDays(30),
            entry.nightDay,
            'Thirty First Day');
        onahs.push(thirtyOne);
        this.add24HourOnah(thirtyOne, onahs);
        this.addOhrZarua(thirtyOne, onahs);

        //Haflagah **********************************************************************
        if (entry.haflaga > 0) {
            const haflaga = new ProblemOnah(
                entry.date.addDays(entry.haflaga - 1),
                entry.nightDay,
                `Yom Haflagah (${entry.haflaga.toString()})`);
            onahs.push(haflaga);
            this.addOhrZarua(haflaga, onahs);

            if (this.settings.keepLongerHaflagah) {
                //First we look for a proceeding entry where the haflagah is longer than this one
                const longerHaflaga = this.list.find(e => e.date.Abs > entry.date.Abs && e.haflaga > entry.haflaga),
                    longerHaflagaDate = longerHaflaga ?
                        longerHaflaga.date :
                        //If no such entry was found, we keep on going...
                        this.stopWarningDate;

                //TODO:How to cheshbon out the Shach (or rather not like the Shach).
                //Is the question from the actual next entry or from the theoretical next entry, or both?

                //First the theoretical problems - not based on real entries
                //We get the first problem Onah
                let longHaflaga = new ProblemOnah(
                    entry.date.addDays(entry.haflaga - 1),
                    entry.nightDay,
                    'Yom Haflaga (' + entry.haflaga.toString() + ')');
                //We don't flag the "which was never overided" for the first one, so we keep track
                let isFirst = true;
                while (longHaflaga.Abs < longerHaflagaDate.Abs) {
                    if (!isFirst) {
                        longHaflaga.Name += ' which was never overided';
                    }

                    onahs.push[longHaflaga];
                    this.addOhrZarua(longHaflaga, onahs);

                    isFirst = false;
                    longHaflaga = new ProblemOnah(
                        longHaflaga.date.addDays(entry.haflaga - 1),
                        entry.nightDay,
                        'Yom Haflaga (' + entry.haflaga.toString() + ')');
                }

                //Now for the non-overided haflagah from the actual entries
                for (let en of this.list.filter(e =>
                    e.date.Abs > entry.date.Abs && e.date.Abs < longerHaflagaDate.Abs)) {
                    longHaflaga = new ProblemOnah(
                        en.date.addDays(entry.haflaga - 1),
                        en.nightDay,
                        'Yom Haflaga (' + entry.haflaga.toString() + ') which was never overrided');
                    onahs.push[longHaflaga];
                    this.addOhrZarua(longHaflaga, onahs);
                }
            }
        }

        return onahs;
    }
    getEntryDependentKavuahProblemOnahs(entry, kavuahList) {
        const onahs = [];

        //Kavuah Haflagah - with or without Maayan Pasuach
        for (let kavuah of kavuahList.filter(k => k.active &&
            (k.kavuahType === KavuahType.Haflagah || k.kavuahType === KavuahType.HaflagaMaayanPasuach))) {
            const kavuahHaflaga = new ProblemOnah(
                entry.date.addDays(kavuah.settingEntry.haflaga - 1),
                kavuah.settingEntry.dayNight,
                'Kavuah of ' + kavuah.toString());
            onahs.push(kavuahHaflaga);
            this.addOhrZarua(kavuahHaflaga, onahs);
        }

        if (this.settings.CheshbonKavuahByActualEntry) {
            //Kavvuah Dilug Haflagos - from actual entry not from what was supposed to be. We cheshbon both.
            //The theoretical ones, are worked out in the function "getIndependentKavuahOnahs"
            for (let kavuah of kavuahList.filter(k => k.kavuahType === KavuahType.DilugHaflaga && k.active)) {
                const kavuahDilugHaflaga = new ProblemOnah(
                    entry.date.addDays(entry.onah.haflaga + kavuah.specialNumber - 1),
                    kavuah.settingEntry.dayNight,
                    'Kavuah by sighting for ' + kavuah.toString());
                onahs.push(kavuahDilugHaflaga);
                this.addOhrZarua(kavuahDilugHaflaga, onahs);
            }

            //TODO: Does Dilug of Yom Hachodesh continue from an actual entry even if it is off cheshbon? For ex. 35, 34, 33, 36 - is the next "35" or just continues theoretically 32, 31....
            //Kavvuah Dilug Yom Hachodesh - even if one was off, only works out from entry not from what was supposed to be.
            //We cheshbon both.
            //The theoretical ones, are worked out in the function "GetIndependentKavuahOnahs"
            for (let kavuah of kavuahList.filter(k => k.kavuahType === KavuahType.DilugDayOfMonth && k.active)) {
                const kavuahDilugDayofMonth = new ProblemOnah(
                    entry.date.addMonths(1).addDays(kavuah.specialNumber),
                    kavuah.settingEntry.nightDay,
                    'Kavuah for ' + kavuah.toString());
                onahs.push(kavuahDilugDayofMonth);
                this.addOhrZarua(kavuahDilugDayofMonth, onahs);
            }
        }

        return onahs;
    }
    getIndependentKavuahProblemOnahs(kavuahList) {
        const onahs = [];

        //Kavuahs of Yom Hachodesh and Sirug
        for (let kavuah of kavuahList.filter(k => k.active &&
            has(k.kavuahType, KavuahType.DayOfMonth, KavuahType.DayOfMonthMaayanPasuach, KavuahType.Sirug))) {
            let dt = kavuah.settingEntry.date.addMonths(
                kavuah.kavuahType === KavuahType.Sirug ? kavuah.specialNumber : 1);
            while (dt.Abs <= this.stopWarningDate.Abs) {
                const o = new ProblemOnah(dt, kavuah.settingEntry.nightDay,
                    'Kavuah for' + kavuah.toString());
                onahs.push(o);
                this.addOhrZarua(o, onahs);

                dt = dt.addMonths(kavuah.kavuahType === KavuahType.Sirug ? kavuah.specialNumber : 1);
            }
        }
        //Kavuahs of "Day of week" - cheshboned from the theoretical Entries
        for (let kavuah of kavuahList.filter(k => k.active && k.kavuahType === KavuahType.DayOfWeek)) {
            let dt = kavuah.settingEntryonah.jdate.addDays(kavuah.specialNumber);
            while (dt.Abs <= this.stopWarningDate.Abs) {
                const o = new ProblemOnah(
                    dt,
                    kavuah.settingEntry.nightDay,
                    'Kavuah for ' + kavuah.ToString());
                onahs.push(o);
                this.addOhrZarua(o, onahs);

                dt = dt.addDays(kavuah.specialNumber);
            }
        }
        if (this.settings.cheshbonKavuahByCheshbon) {
            //Kavuahs of Yom Hachodesh of Dilug - cheshboned from the theoretical Entries
            for (let kavuah of kavuahList.filter(k => k.active && k.kavuahType === KavuahType.DilugDayOfMonth)) {
                let dt = kavuah.settingEntry.date;
                for (let i = 0; ; i++) {
                    dt = dt.addMonths(1);
                    const dtNext = dt.addDays(kavuah.specialNumberNumber * i);
                    //We stop when we get to the beginning or end of the month
                    if (dtNext.Month !== dt.Month || dtNext.Abs > this.stopWarningDate.Abs) {
                        break;
                    }
                    const o = new ProblemOnah(
                        dtNext,
                        kavuah.settingEntry.
                            nightDay,
                        'Kavuah for ' + kavuah.toString());
                    onahs.push(o);
                    this.addOhrZarua(o, onahs);
                }
            }
            //Kavuahs of Yom Haflaga of Dilug - cheshboned from the theoretical Entries
            for (let kavuah of kavuahList.filter(k => k.active && k.kavuahType === KavuahType.DilugHaflaga)) {
                let dt = kavuah.settingEntry.date;
                for (let i = 1; ; i++) {
                    //For negative dilugim, we stop when we get to 0
                    if (((kavuah.settingEntry.haflaga) + (kavuah.specialNumber * i)) < 1) {
                        break;
                    }
                    dt = dt.addDays(((kavuah.settingEntry.haflaga + (kavuah.specialNumber * i))) + (-1));
                    if (dt.Abs > this.stopWarningDate.Abs) {
                        break;
                    }
                    const o = new ProblemOnah(
                        dt,
                        kavuah.settingEntry.nightDay,
                        'Kavuah by theoretical calculation for ' + kavuah.ToString());
                    onahs.push(o);
                    this.addOhrZarua(o, onahs);
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
}