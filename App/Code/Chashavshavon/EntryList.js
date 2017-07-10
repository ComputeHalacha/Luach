import { isNumber } from '../GeneralUtils';
import jDate from '../JCal/jDate';
import Entry from './Entry';
import Settings from '../Settings';
import FlaggedDatesGenerator from './FlaggedDatesGenerator';

const today = new jDate();

export default class EntryList {
    constructor(settings, entryList) {
        this.list = entryList || [];
        this.settings = settings || new Settings();
        this.stopWarningDate = today.addMonths(this.settings.numberMonthsAheadToWarn);
        //List of entries that can generate flagged dates. This is set in calculateHaflagas.
        this.realEntrysList = [];
        this.probOnahs = [];
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
        return this.realEntrysList[this.realEntrysList.length - 1];
    }
    /**
     * Calculates the haflagas for all the entries in the list.
     */
    calulateHaflagas() {
        //Sort all the entries by date
        const list = EntryList.sortEntries(this.list);

        //List of entries that can generate flagged dates.
        this.realEntrysList = list.filter(e => !e.ignoreForFlaggedDates);

        for (let entry of this.realEntrysList) {
            const index = this.realEntrysList.indexOf(entry);
            //First Entry in the list does not have a Haflaga
            entry.setHaflaga((index > 0) && list[index - 1]);
        }
    }
    getProblemOnahs(kavuahList) {
        const generator  = new FlaggedDatesGenerator(
            this.realEntrysList,
            this.settings,
            kavuahList);
        return generator.getProblemOnahs();
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
}