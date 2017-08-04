import { NightDay } from './Onah';
import { KavuahTypes } from './Kavuah';
import { ProblemFlag, ProblemOnah } from './ProblemOnah';
import jDate from '../JCal/jDate';
import { has } from '../GeneralUtils';

/**
 * This class is used to Generate Problem Onahs from
 * a list of Entries, a list of Kavuahs and a Settings object.
 * Use: new FlaggedDatesGenerator(entries, kavuahs, settings).getProblemOnahs()
 */
export default class FlaggedDatesGenerator {
    /**
     * @param {[Entry]} entries
     * @param {[Kavuah]} kavuahs
     * @param {Settings} settings
     */
    constructor(entries, kavuahs, settings) {
        this.entries = entries;
        this.settings = settings;
        this.kavuahs = (kavuahs && kavuahs.filter(k =>
            k.active && !k.ignore)) || [];
        this.cancelKavuah = kavuahs.find(k =>
            k.active && k.cancelsOnahBeinunis);
        this.probOnahs = [];
        this.stopWarningDateAbs = jDate.toJDate().addMonths(
            this.settings.numberMonthsAheadToWarn).Abs;
    }
    /**
     * Gets the list of Onahs that need to be observed.
     * Problem Onahs are searched for from the date of each entry
     * until the number of months specified in the
     * Property Setting "numberMonthsAheadToWarn"
     */
    getProblemOnahs() {
        //Clean the list
        this.probOnahs = [];

        //Find Flagged Dates that need to be calculated from the list of Entries.
        for (let entry of this.entries) {
            this._findOnahBeinunisProblemOnahs(entry, this.cancelKavuah);
            //Get problems generated by active Kavuahs
            this._findEntryDependentKavuahProblemOnahs(entry);
        }

        //Get the onahs that need to be kept for Kavuahs of Yom Hachodesh, Sirug,
        //and other Kavuahs that are not dependent on the actual entry list
        this._findIndependentKavuahProblemOnahs();

        //Sort the problem list and return it
        return ProblemOnah.sortProbList(this.probOnahs);
    }
    _findOnahBeinunisProblemOnahs(entry, cancelKavuah) {
        //Yom Hachodesh
        const nextMonth = entry.date.addMonths(1),
            //If Yom Hachodesh was 30 and this month only has 29 days,
            //the 29th and the 1st should both be flagged.
            //In the above scenario, jdate.addMonths will automatically change the Day to 29.
            hasFullMonthIssue = (entry.date.Day === 30 && nextMonth.Day === 29);

        if (!isAfterKavuahStart(nextMonth, entry.nightDay, cancelKavuah)) {
            const yomHachodesh = new ProblemFlag(
                nextMonth,
                entry.nightDay,
                'Yom Hachodesh' + (hasFullMonthIssue ? ' (changed from 30 to 29)' : ''));
            this._addProblem(yomHachodesh);
            this._add24HourOnah(yomHachodesh);
            //We won't flag the Ohr Zarua if it's included in Onah Beinonis
            //of 24 hours as Onah Beinonis is stricter.
            if ((!this.settings.onahBeinunis24Hours) || entry.nightDay === NightDay.Night) {
                this._addOhrZarua(yomHachodesh);
            }
        }
        //If Yom Hachodesh was 30 and this month only has 29 days, we add the 1st of the next month.
        if (hasFullMonthIssue) {
            const nextDay = nextMonth.addDays(1);
            if (!isAfterKavuahStart(nextDay, entry.nightDay, cancelKavuah)) {
                const yomHachodesh_2 = new ProblemFlag(
                    nextDay,
                    entry.nightDay,
                    'Yom Hachodesh (changed from 30 to 1)');
                this._addProblem(yomHachodesh_2);
                this._add24HourOnah(yomHachodesh_2);
                //We won't flag the Ohr Zarua if it's included in Onah Beinonis
                //of 24 hours as Onah Beinonis is stricter.
                if ((!this.settings.onahBeinunis24Hours) || entry.nightDay === NightDay.Night) {
                    this._addOhrZarua(yomHachodesh_2);
                }
            }
        }
        //Day Thirty ***************************************************************
        const dayThirty = entry.date.addDays(29);
        if (!isAfterKavuahStart(dayThirty, entry.nightDay, cancelKavuah)) {
            const thirty = new ProblemFlag(
                dayThirty,
                entry.nightDay,
                'Thirtieth Day');
            this._addProblem(thirty, entry);
            this._add24HourOnah(thirty, entry);
            //We won't flag the Ohr Zarua if it's included in Onah Beinonis
            //of 24 hours as Onah Beinonis is stricter.
            if ((!this.settings.onahBeinunis24Hours) || entry.nightDay === NightDay.Night) {
                this._addOhrZarua(thirty, entry);
            }
        }
        //Day Thirty One ***************************************************************
        if (this.settings.keepThirtyOne) {
            const dayThirtyOne = dayThirty.addDays(1);
            if (!isAfterKavuahStart(dayThirtyOne, entry.nightDay, cancelKavuah)) {
                const thirtyOne = new ProblemFlag(
                    dayThirtyOne,
                    entry.nightDay,
                    'Thirty First Day');
                this._addProblem(thirtyOne, entry);
                this._add24HourOnah(thirtyOne, entry);
                //We won't flag the Ohr Zarua if it's included in Onah Beinonis
                //of 24 hours as Onah Beinonis is stricter.
                if ((!this.settings.onahBeinunis24Hours) || entry.nightDay === NightDay.Night) {
                    this._addOhrZarua(thirtyOne, entry);
                }
            }
        }
        //Haflagah **********************************************************************
        const haflagaDate = entry.date.addDays(entry.haflaga - 1);
        if ((entry.haflaga > 0) &&
            (!isAfterKavuahStart(haflagaDate, entry.nightDay, cancelKavuah))) {
            const haflaga = new ProblemFlag(
                haflagaDate,
                entry.nightDay,
                `Yom Haflagah (of ${entry.haflaga.toString()} days)`);
            //Note the Haflaga is always just the Onah it occurred on - not 24 hours  -
            //even according to those that require it for 30, 31 and Yom Hachodesh.
            this._addProblem(haflaga, entry);
            this._addOhrZarua(haflaga, entry);
        }
        //Haflagah of Onahs *************************************************************
        if (this.settings.haflagaOfOnahs) {
            const prevEntry = this.entries[this.entries.indexOf(entry) - 1];
            //If they have the same nightDay then it will be a regular haflaga
            if (prevEntry && prevEntry.nightDay !== entry.nightDay) {
                const diffOnahs = prevEntry.getOnahDifferential(entry),
                    nextOnah = entry.onah.addOnahs(diffOnahs);
                if (!isAfterKavuahStart(nextOnah.jdate, nextOnah.nightDay, cancelKavuah)) {
                    const haflagaOnahs = new ProblemFlag(
                        nextOnah.jdate,
                        nextOnah.nightDay,
                        `Haflagah of Onahs (of ${diffOnahs.toString()} onahs)`);
                    this._addProblem(haflagaOnahs);
                    this._addOhrZarua(haflagaOnahs);
                }
            }
        }
        //The Ta"z
        if (this.settings.keepLongerHaflagah) {
            const probs = [];
            //Go through all earlier entries in the list that have a longer haflaga than this one
            for (let e of this.entries.filter(en =>
                en.date.Abs < entry.date.Abs && en.haflaga > entry.haflaga)) {
                //See if their haflaga was never surpassed by an Entry after them
                if (!this.entries.some(oe =>
                    oe.date.Abs > e.date.Abs &&
                    oe.haflaga > e.haflaga)) {
                    const haflagaDate = entry.date.addDays(e.haflaga - 1);
                    if (!isAfterKavuahStart(haflagaDate, entry.nightDay, cancelKavuah)) {
                        let nonOverrided = new ProblemFlag(
                            haflagaDate,
                            entry.nightDay,
                            'Yom Haflaga (' + e.haflaga.toString() + ' days) which was never overided');
                        //As there can be more than single longer haflaga'd Entry with the same haflaga,
                        //we want to prevent doubles.
                        if (!probs.some(p => p.isSameProb(nonOverrided))) {
                            probs.push(nonOverrided);
                        }
                    }
                }
            }
            for (let prob of probs) {
                this._addProblem(prob);
                this._addOhrZarua(prob);
            }
        }
    }
    _findEntryDependentKavuahProblemOnahs(entry) {
        //Kavuah Haflagah - with or without Maayan Pasuach
        for (let kavuah of this.kavuahs.filter(k =>
            (k.kavuahType === KavuahTypes.Haflagah || k.kavuahType === KavuahTypes.HaflagaMaayanPasuach))) {
            const haflagaDate = entry.date.addDays(kavuah.settingEntry.haflaga - 1),
                kavuahHaflaga = new ProblemFlag(
                    haflagaDate,
                    kavuah.settingEntry.nightDay,
                    'Kavuah of ' + kavuah.toString());
            this._addProblem(kavuahHaflaga);
            this._addOhrZarua(kavuahHaflaga);
        }

        //Kavuah of Dilug Haflaga.
        //They are cheshboned from actual entries - not theoretical ones
        for (let kavuah of this.kavuahs.filter(k =>
            k.kavuahType === KavuahTypes.DilugHaflaga && k.active)) {
            const settingEntry = kavuah.settingEntry,
                //the number of entries from the setting entry until this one
                numberEntry = this.entries.indexOf(entry) - this.entries.indexOf(settingEntry);
            if (numberEntry > 0) {
                //add the dilug number for each entry to the original haflaga
                const haflaga = settingEntry.haflaga + (kavuah.specialNumber * numberEntry);
                //If haflaga is 0, there is no point...
                if (haflaga) {
                    const haflagaDate = entry.date.addDays(haflaga - 1),
                        kavuahDilugHaflaga = new ProblemFlag(
                            haflagaDate,
                            kavuah.settingEntry.nightDay,
                            'Kavuah of ' + kavuah.toString());
                    this._addProblem(kavuahDilugHaflaga);
                    this._addOhrZarua(kavuahDilugHaflaga);
                }
            }
        }
        //Flagged Dates generated by Kavuahs of Haflagah by Onahs - the Shulchan Aruch Harav
        for (let kavuah of this.kavuahs.filter(k =>
            (k.kavuahType === KavuahTypes.HafalagaOnahs))) {
            const haflagaOnah = entry.onah.addOnahs(kavuah.specialNumber),
                kavuahHafOnahs = new ProblemFlag(
                    haflagaOnah.jdate,
                    haflagaOnah.nightDay,
                    'Kavuah of ' + kavuah.toString());
            this._addProblem(kavuahHafOnahs);
            this._addOhrZarua(kavuahHafOnahs);
        }
    }
    _findIndependentKavuahProblemOnahs() {
        //Kavuahs of Yom Hachodesh and Sirug
        for (let kavuah of this.kavuahs.filter(k =>
            has(k.kavuahType, KavuahTypes.DayOfMonth, KavuahTypes.DayOfMonthMaayanPasuach, KavuahTypes.Sirug))) {
            let dt = kavuah.settingEntry.date.addMonths(
                kavuah.kavuahType === KavuahTypes.Sirug ? kavuah.specialNumber : 1);
            while (dt.Abs <= this.stopWarningDateAbs) {
                const o = new ProblemFlag(dt, kavuah.settingEntry.nightDay,
                    'Kavuah for ' + kavuah.toString());
                this._addProblem(o);
                this._addOhrZarua(o);

                dt = dt.addMonths(kavuah.kavuahType === KavuahTypes.Sirug ? kavuah.specialNumber : 1);
            }
        }
        //Kavuahs of "Day of week" - cheshboned from the theoretical Entries
        for (let kavuah of this.kavuahs.filter(k => k.kavuahType === KavuahTypes.DayOfWeek)) {
            let dt = kavuah.settingEntry.date.addDays(kavuah.specialNumber);
            while (dt.Abs <= this.stopWarningDateAbs) {
                const o = new ProblemFlag(
                    dt,
                    kavuah.settingEntry.nightDay,
                    'Kavuah for ' + kavuah.ToString());
                this._addProblem(o);
                this._addOhrZarua(o);

                dt = dt.addDays(kavuah.specialNumber);
            }
        }
        //Kavuahs of Yom Hachodesh of Dilug - these are cheshboned from the theoretical Entries
        for (let kavuah of this.kavuahs.filter(k => k.kavuahType === KavuahTypes.DilugDayOfMonth)) {
            let nextMonth = kavuah.settingEntry.date.addMonths(1);
            for (let i = 1; ; i++) {
                //Add the correct number of dilug days
                const addDilugDays = nextMonth.addDays(kavuah.specialNumber * i);
                //If set to stop when we get to the beginning or end of the month
                if ((this.settings.cheshbonKavuahByCheshbon && (addDilugDays.Month !== nextMonth.Month))
                    ||
                    addDilugDays.Abs > this.stopWarningDateAbs) {
                    break;
                }
                const o = new ProblemFlag(
                    addDilugDays,
                    kavuah.settingEntry.nightDay,
                    'Kavuah for ' + kavuah.toString());
                this._addProblem(o);
                this._addOhrZarua(o);

                nextMonth = nextMonth.addMonths(1);
            }
        }
    }
    _add24HourOnah(prob, entry) {
        if (this.settings.onahBeinunis24Hours) {
            this._addProblem(new ProblemFlag(
                prob.jdate,
                prob.nightDay === NightDay.Day ? NightDay.Night : NightDay.Day,
                prob.description + ' (24 hour)'), entry);
        }
    }
    _addOhrZarua(prob, entry) {
        //If the user wants to see keep the Ohr Zarua  - the previous onah
        if (this.settings.showOhrZeruah) {
            const ohrZarua = prob.onah.previous;
            this._addProblem(new ProblemFlag(
                ohrZarua.jdate,
                ohrZarua.nightDay,
                'Ohr Zarua of the ' + prob.description), entry);
        }
    }
    /**
     * Add the given ProblemFlag to the flagsList of the ProblemOnah for the given Onah.
     * If there isn't yet a ProblemOnah for this Onah in this.probOnahs, it will be added.
     * @param {ProblemFlag} probFlag
     * @param {Entry} [settingEntry] optional entry to pass on to the _canAddFlaggedDate function.
     */
    _addProblem(probFlag, settingEntry) {
        if (this._canAddFlaggedDate(probFlag, settingEntry)) {
            let probOnah = this.probOnahs.find(po => po.isSameOnah(probFlag.onah));
            if (!probOnah) {
                probOnah = new ProblemOnah(probFlag.jdate, probFlag.nightDay);
                this.probOnahs.push(probOnah);
            }
            probOnah.flagsList.push(probFlag.description);
        }
    }
    /**
     * Returns false if the noProbsAfterEntry setting is on and there was an Entry
     * in the 7 days before the given onah.
     * Will also return false if the settingEntry is supplied, and keepLongerHaflagah is off,
     * and there was another entry between the settingEntry and the problem onah.
     * This is to prevent flagging haflaga type problems when there were other entries before the problem onah.
     * @param {jDate} date
     * @param {NightDay} nightDay
     * @param {Entry} [settingEntry] if supplied and the keepLongerHaflagah is off and
     * there was another Entry between the settingEntry and the problem onah,
     * will cause this function to return false.
     */
    _canAddFlaggedDate(probFlag, settingEntry) {
        const jdate = probFlag.jdate, nightDay = probFlag.nightDay;
        if ((!this.settings.keepLongerHaflagah) && settingEntry &&
            this.entries.some(e =>
                //If there is an Entry in the list that is after the setting entry
                (e.date.Abs > settingEntry.date.Abs ||
                    (e.date.Abs === settingEntry.date.Abs && e.nightDay > settingEntry.nightDay)) &&
                //and that entry is before the prospective problem onah
                (e.date.Abs < jdate.Abs || (e.date.Abs === jdate.Abs && e.nightDay < nightDay)))) {
            //The problem will not be flagged
            return false;
        }
        if (!this.settings.noProbsAfterEntry) {
            return true;
        }
        else {
            return !this.entries.some(en =>
                en.date.Abs >= (jdate.Abs - 7) &&
                (en.date.Abs < jdate.Abs || (en.date.Abs === jdate.Abs && en.nightDay < nightDay))
            );
        }
    }
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
function isAfterKavuahStart(date, nightDay, kavuah) {
    if (kavuah) {
        const settingEntry = kavuah.settingEntry;
        return settingEntry && (
            (date.Abs > settingEntry.date.Abs) ||
            (date.Abs === settingEntry.date.Abs && nightDay > settingEntry.nightDay));
    }
}