import jDate from '../JCal/jDate';
import Entry from './Entry';
import Onah from './Onah';
import Settings from './Settings';
import NightDay from './NightDay';
import ProblemOnah from './ProblemOnah';

export default class EntryList {
    constructor(settings) {
        this.list = [];
        this.settings = settings || new Settings();
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
        const prev = this.list[this.list.indexOf(entry) - 1],
            next = this.list[this.list.indexOf(entry) + 1];

        let onahs = [];

        //Day Thirty ***************************************************************
        const thirty = new ProblemOnah(entry.onah.jdate.addDays(29),
            entry.onah.nightDay,
            "Day Thirty");
        onahs.push(thirty);
        //If the user wants to keep 24 hours for the Onah Beinunis
        if (this.settings.onahBeinunis24Hours) {
            onahs.push(new ProblemOnah(thirty.onah.jdate,
                thirty.nightDay === NightDay.Day ? NightDay.Night : NightDay.Day,
                "Day Thirty"));
        }
        //If the user wants to keep the Ohr Zarua  - the previous onah
        if (this.settings.showOhrZeruah) {
            const thirtyOhrZarua = thirty.previous;
            onahs.push(new ProblemOnah(thirtyOhrZarua.jdate,
                thirtyOhrZarua.nightDay,
                "Ohr Zarua of Day Thirty"));
        }

        //Day Thirty One ***************************************************************
        const thirtyOne = new ProblemOnah(entry.onah.jdate.addDays(30),
            entry.onah.nightDay,
            "Day Thirty One");
        onahs.push(thirtyOne);
        //If the user wants to keep 24 hours for the Onah Beinunis
        if (this.settings.onahBeinunis24Hours) {
            onahs.push(new ProblemOnah(thirtyOne.onah.jdate,
                thirtyOne.nightDay === NightDay.Day ? NightDay.Night : NightDay.Day,
                "Day Thirty One"));
        }
        //If the user wants to see keep the Ohr Zarua  - the previous onah
        if (this.settings.showOhrZeruah) {
            const thirtyOneOhrZarua = thirtyOne.previous;
            onahs.push(new ProblemOnah(thirtyOneOhrZarua.jdate,
                thirtyOneOhrZarua.nightDay,
                "Ohr Zarua of Day Thirty One"));
        }

        //Haflagah **********************************************************************
        if (entry.haflaga) {
            if (!settings.keepLongerHaflagah) {
                const haflaga = new ProblemOnah(entry.onah.jdate.addDays(entry.haflaga - 1),
                    entry.onah.nightDay,
                    `Yom Haflagah (${entry.haflaga.toString()})`);
                probOnahs.push(haflaga);
                //If the user wants to see keep the Ohr Zarua  - the previous onah
                if (this.settings.showOhrZeruah) {
                    const haflagaOhrZarua = haflaga.previous;
                    onahs.push(new ProblemOnah(haflagaOhrZarua.jdate,
                        haflagaOhrZarua.nightDay,
                        `Ohr Zarua of Yom Haflagah (${entry.haflaga.toString()})`));
                }
            }
            else {
                //First we look for a proceeding entry where the haflagah is longer than this one
                let longerHaflaga = this.list.find(e => e.onah.jdate.Abs > entry.onah.jdate.Abs && e.haflaga > onah.haflaga);
                if (!!longerHaflagah) {
                    longerHaflaga = longerHaflaga.onah.jdate;
                }
                else {
                    //If no such entry was found, we keep on going...
                    longerHaflagah = new jDate().addMonths(this.settings.numberMonthsAheadToWarn);
                }

                //TODO:How to cheshbon out the Shach (or rather not like the Shach).
                //Is the question from the actual next entry or from the theoretical next entry, or both?

                //First the theoretical problems - not based on real entries
                //We get the first problem Onah
                let onah = new ProblemOnah(entry.onah.jdate.addDays(entry.haflaga - 1),
                        entry.nightDay,
                        "Yom Haflaga (" + entry.haflaga.toString() + ")");
                //We don't flag the "שלא נתבטלה" for the first one, so we keep track
                let isFirst = true;
                while (onah.Abs < longerHaflagah.Abs) {
                    if (!isFirst) {
                        onah.Name += " which was never overided";
                    }
                    onahs.push[onah];
                    if (Properties.Settings.Default.ShowOhrZeruah) {
                        Onah ooz = Onah.GetPreviousOnah(on);
                        ooz.Name = "או\"ז של " + on.Name;
                        ooz.IsIgnored = cancelOnahBeinenis;
                        this.ProblemOnas.Add(ooz);
                    }
                    isFirst = false;
                    on = on.AddDays(entry.Interval - 1);
                }

                //Now for the non-overided haflagah from the actual entries
                foreach(Entry en in Entry.EntryList.Where(e =>
                    e.DateTime > entry.DateTime && e.DateTime < longerHaflagah))
                {
                    on = en.AddDays(entry.Interval - 1);
                    on.Name = "יום הפלגה (" + entry.Interval + ") שלא נתבטלה";
                    on.IsIgnored = cancelOnahBeinenis;
                    this.ProblemOnas.Add(on);
                    if (Properties.Settings.Default.ShowOhrZeruah) {
                        Onah ooz = Onah.GetPreviousOnah(on);
                        ooz.Name = "או\"ז של " + on.Name;
                        ooz.IsIgnored = cancelOnahBeinenis;
                        this.ProblemOnas.Add(ooz);
                    }
                }
            }
        }

        return onahs;
    }
    getEntryDependentKavuahProblemOnahs(entry, kavuahList) {
        let onahs = [];
        return onahs;
    }
    getIndependentKavuahProblemOnahs(entry, kavuahList) {
        let onahs = [];
        return onahs;
    }
}