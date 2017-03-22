import has from '../GeneralUtils';
import jDate from '../JCal/jDate';
import Entry from './Entry';
import Onah from './Onah';
import Settings from './Settings';
import NightDay from './NightDay';
import ProblemOnah from './ProblemOnah';
import KavuahType from './KavuahType';

const today = new jDate();

export default class EntryList {
    constructor(settings, entryList) {
        this.list = entryList || [];
        this.settings = settings || new Settings();
        this.stopWarningDate = today.addMonths(this.settings.numberMonthsAheadToWarn);
    }
    add(e) {
        if (!e instanceof Entry) {
            throw 'Only objects of type Entry can be added to the EntryList';
        }
        else {
            if (!this.list.find(entry => entry.isSameEntry(e))) {
                this.list.push(e);
            }
        }
        //To help working out Kavuahs, returns an array with the previous Entry and the currently added one.
        return [this.list[this.list.length - 2], e];
    }
    getProblemOnahs(kavuahList) {
        let probOnahs = [];
        const cancelOnahBeinenis = kavuahList.find(k => k.active && k.cancelsOnahBeinunis);

        //A list of Onahs that need to be kept. This first list is worked out from the list of Entries.
        //Problem Onahs are searched for from the date of each entry until the number of months specified in the
        //Property Setting "numberMonthsAheadToWarn"
        for (let entry of this.list.filter(en => en.active)) {
            if (!cancelOnahBeinenis) {
                probOnahs = [...probOnahs, ...this.getOnahBeinunisProblemOnahs(entry)];
            }
            probOnahs = [...probOnahs, ...this.getEntryDependentKavuahProblemOnahs(entry, kavuahList)];
        }

        //Get the onahs that need to be kept for Kavuahs of yom hachodesh, sirug,
        //dilug (from projected day - not actual entry)
        //and other Kavuahs that are not dependent on the actual entry list
        probOnahs = [...probOnahs, ...this.getIndependentKavuahProblemOnahs(kavuahList)];

        return probOnahs;
    }
    getOnahBeinunisProblemOnahs(entry) {
        let onahs = [];

        //Day Thirty ***************************************************************
        const thirty = new ProblemOnah(entry.onah.jdate.addDays(29),
            entry.onah.nightDay,
            "Day Thirty");
        onahs.push(thirty);
        this.add24HourOnah(thirty, onahs);
        this.addOhrZarua(thirty, onahs);

        //Day Thirty One ***************************************************************
        const thirtyOne = new ProblemOnah(entry.onah.jdate.addDays(30),
            entry.onah.nightDay,
            "Day Thirty One");
        onahs.push(thirtyOne);
        this.add24HourOnah(thirtyOne, onahs);
        this.addOhrZarua(thirtyOne, onahs);

        //Haflagah **********************************************************************
        if (entry.haflaga) {
            if (!settings.keepLongerHaflagah) {
                const haflaga = new ProblemOnah(entry.onah.jdate.addDays(entry.haflaga - 1),
                    entry.onah.nightDay,
                    `Yom Haflagah (${entry.haflaga.toString()})`);
                probOnahs.push(haflaga);
                this.addOhrZarua(haflaga, onahs);
            }
            else {
                //First we look for a proceeding entry where the haflagah is longer than this one
                const longerHaflaga = this.list.find(e => e.onah.jdate.Abs > entry.onah.jdate.Abs && e.haflaga > longHaflaga.haflaga),
                    longerHaflagaDate = longerHaflaga ?
                        longerHaflaga.onah.jdate :
                        //If no such entry was found, we keep on going...
                        this.stopWarningDate;

                //TODO:How to cheshbon out the Shach (or rather not like the Shach).
                //Is the question from the actual next entry or from the theoretical next entry, or both?

                //First the theoretical problems - not based on real entries
                //We get the first problem Onah
                let longHaflaga = new ProblemOnah(entry.onah.jdate.addDays(entry.haflaga - 1),
                    entry.nightDay,
                    "Yom Haflaga (" + entry.haflaga.toString() + ")");
                //We don't flag the "which was never overided" for the first one, so we keep track
                let isFirst = true;
                while (longHaflaga.Abs < longerHaflagaDate.Abs) {
                    if (!isFirst) {
                        longHaflaga.Name += " which was never overided";
                    }

                    onahs.push[longHaflaga];
                    this.addOhrZarua(longHaflaga, onahs);

                    isFirst = false;
                    longHaflaga = new ProblemOnah(longHaflaga.onah.jdate.addDays(entry.haflaga - 1),
                        entry.nightDay,
                        "Yom Haflaga (" + entry.haflaga.toString() + ")");
                }

                //Now for the non-overided haflagah from the actual entries
                for (let en of this.list.filter(e =>
                    en.onah.jdate.Abs > entry.onah.jdate.Abs && en.onah.jdate.Abs < longerHaflagaDate.Abs)) {
                    longHaflaga = new ProblemOnah(entry.onah.jdate.addDays(entry.haflaga - 1),
                        entry.nightDay,
                        "Yom Haflaga (" + entry.haflaga.toString() + ") which was never overrided");
                    onahs.push[longHaflaga];
                    this.addOhrZarua(longHaflaga, onahs);
                }
            }
        }

        return onahs;
    }
    getEntryDependentKavuahProblemOnahs(entry, kavuahList) {
        let onahs = [];

        //Kavuah Haflagah - with or without Maayan Pasuach
        for (let kavuah of kavuahList.filter(k => k.active &&
            (k.kavuahType === KavuahType.Haflagah || k.kavuahType === KavuahType.HaflagaMaayanPasuach))) {
            const kavuahHaflaga = new ProblemOnah(entry.onah.jdate.AddDays(kavuah.settingEntry.haflaga - 1),
                kavuah.settingEntry.dayNight,
                "Kavuah of " + kavuah.toString());
            onahs.push(kavuahHaflaga);
            this.addOhrZarua(kavuahHaflaga, onahs);
        }

        if (this.settings.CheshbonKavuahByActualEntry) {
            //Kavvuah Dilug Haflagos - from actual entry not from what was supposed to be. We cheshbon both.
            //The theoretical ones, are worked out in the function "GetIndependentKavuahOnahs"
            for (let kavuah of kavuahList.filter(k => k.kavuahType === KavuahType.DilugHaflaga && k.active)) {
                const kavuahDilugHaflaga = new ProblemOnah(
                    entry.onah.jdate.AddDays(entry.onah.haflaga + kavuah.specialNumber - 1),
                    kavuah.settingEntry.dayNight,
                    "Kavuah by sighting for " + kavuah.toString());
                onahs.push(kavuahDilugHaflaga);
                this.addOhrZarua(kavuahDilugHaflaga, onahs);
            }

            //TODO: Does Dilug of Yom Hachodesh continue from an actual entry even if it is off cheshbon? For ex. 35, 34, 33, 36 - is the next "35" or just continues theoretically 32, 31....
            //Kavvuah Dilug Yom Hachodesh - even if one was off, only works out from entry not from what was supposed to be.
            //We cheshbon both.
            //The theoretical ones, are worked out in the function "GetIndependentKavuahOnahs"
            for (let kavuah of kavuahList.filter(k => k.kavuahType === KavuahType.DilugDayOfMonth && k.active)) {
                const kavuahDilugDayofMonth = new ProblemOnah(
                    entry.onah.jdate.addMonths(1).addDays(kavuah.specialNumber),
                    kavuah.settingEntry.nightDay,
                    "Kavuah for " + kavuah.toString());
                onahs.push(kavuahDilugDayofMonth);
                this.addOhrZarua(kavuahDilugDayofMonth, onahs);
            }
        }

        return onahs;
    }
    getIndependentKavuahProblemOnahs(entry, kavuahList) {
        let onahs = [];

        //Kavuahs of Yom Hachodesh and Sirug
        for (let kavuah of kavuahList.filter(k => k.active &&
            has(k.kavuahType, KavuahType.DayOfMonth, KavuahType.DayOfMonthMaayanPasuach, KavuahType.Sirug))) {
            for (let dt = kavuah.settingEntry.onah.jdate.AddMonths(
                kavuah.kavuahType === KavuahType.Sirug ? kavuah.specialNumber : 1);
                dt.Abs <= this.stopWarningDate.Abs;
                dt = dt.AddMonths(kavuah.kavuahType === KavuahType.Sirug ? kavuah.specialNumber : 1)) {

                const o = new ProblemOnah(dt, kavuah.settingEntry.onah.nightDay,
                    "Kavuah for" + kavuah.toString());
                onahs.push(o);
                this.addOhrZarua(o, onahs);
            }
        }
        //Kavuahs of "Day of week" - cheshboned from the theoretical Entries
        for (let kavuah of kavuahList.filter(k => k.active &&
            k.kavuahType === KavuahType.DayOfWeek)) {
            for (let dt = kavuah.settingEntryonah.jdate.AddDays(kavuah.specialNumber);
                dt.Abs <= this.stopWarningDate.Abs;
                dt = dt.AddDays(kavuah.specialNumber)) {
                const o = new ProblemOnah(dt, kavuah.settingEntry.onah.nightDay,
                    "Kavuah for " + kavuah.ToString());
                onahs.push(o);
                this.addOhrZarua(o, onahs);
            }
        }
        if (this.settings.cheshbonKavuahByCheshbon) {
            //Kavuahs of Yom Hachodesh of Dilug - cheshboned from the theoretical Entries
            for (let kavuah of kavuahList.filter(k => k.active && k.kavuahType === KavuahType.DilugDayOfMonth)) {
                const dt = kavuah.settingEntry.onah.jdate;
                for (let i = 0; ; i++) {
                    dt = dt.AddMonths(1);
                    const dtNext = dt.AddDays(kavuah.specialNumberNumber * i);
                    //We stop when we get to the beginning or end of the month
                    if (dtNext.Month !== dt.Month || dtNext.Abs > this.stopWarningDate.Abs) {
                        break;
                    }
                    const o = new ProblemOnah(dtNext, kavuah.settingEntry.onah.nightDay,
                        "Kavuah for " + kavuah.toString());
                    onahs.push(o);
                    this.addOhrZarua(o, onahs);
                }
            }
            //Kavuahs of Yom Haflaga of Dilug - cheshboned from the theoretical Entries
            for (let kavuah of kavuahList.filter(k => k.active && k.kavuahType === KavuahType.DilugHaflaga)) {
                let dt = kavuah.settingEntry.onah.jdate;
                for (let i = 1; ; i++) {
                    //For negative dilugim, we stop when we get to 0
                    if (((kavuah.settingEntry.haflaga) + (kavuah.specialNumber * i)) < 1) {
                        break;
                    }
                    dt = dt.AddDays(((kavuah.settingEntry.haflaga + (kavuah.specialNumber * i))) + (-1));
                    if (dt.Abs > this.stopWarningDate.Abs) {
                        break;
                    }
                    const o = new ProblemOnah(dt, kavuah.settingEntry.onah.nightDay,
                        "Kavuah by theoretical calculation for " + kavuah.ToString());
                    onahs.push(o);
                    this.addOhrZarua(o, onahs);
                }
            }
        }

        return onahs;
    }
    add24HourOnah(probOnah, probList) {
        if (this.settings.onahBeinunis24Hours) {
            probList.push(new ProblemOnah(probOnah.onah.jdate,
                probOnah.nightDay === NightDay.Day ? NightDay.Night : NightDay.Day,
                probOnah.name));
        }
    }
    addOhrZarua(probOnah, probList) {
        //If the user wants to see keep the Ohr Zarua  - the previous onah
        if (this.settings.showOhrZeruah) {
            const ohrZarua = probOnah.previous;
            probList.push(new ProblemOnah(ohrZarua.jdate,
                ohrZarua.nightDay,
                "Ohr Zarua of " + probOnah.name));
        }
    }
    getKavuahSuggestions() {
        return EntryList.getKavuahSuggestionList(this.list);
    }
    //Works out all possible Kavuahs from the given list of entries.
    static getKavuahSuggestionList(entryList) {
        let list = [];

        return list;
    }
}