import { NightDay, Onah } from './Onah';
import Utils from '../JCal/Utils';

/**
 * Represents all the problems of a single Onah.
 * The flagList contains an Array of strings, each describing one problem.
 */
export class ProblemOnah extends Onah {
    /**
     * @param {jDate} jdate
     * @param {NightDay} nightDay
     * @param {[String]} flagsList
     */
    constructor(jdate, nightDay, flagsList) {
        if (!jdate) {
            throw 'jdate must be supplied.';
        }
        if (!nightDay) {
            throw 'nightDay must be supplied.';
        }
        super(jdate, nightDay);
        this.flagsList = flagsList || [];
    }
    /**
     * Returns a detailed text description for the entire Onah.
     * Each flag description is shown on its own line and prefixed with a "►".
     */
    toString() {
        const goyDate =
            this.nightDay === NightDay.Night
                ? this.jdate.addDays(-1).getDate()
                : this.jdate.getDate();
        return (
            `The ${this.nightDay === NightDay.Night ? 'night' : 'day'} of ` +
            this.jdate.toString() +
            ` (${goyDate.toLocaleDateString()}) is the:` +
            this.flagsList.map(f => '\n  ►  ' + f).join('')
        );
    }
    /**
     * Determines if the given ProblemOnah is on the same Onah
     * and has all the flags that this one does.
     * @param {ProblemOnah} prob
     */
    isSameProb(prob) {
        return (
            this.isSameOnah(prob) &&
            this.flagsList.every(f => prob.flagsList.some(pf => pf === f))
        );
    }
    /**
     * Filter a list of problem onahs for the ones pertaining to the given date.
     * @param {JDate} jdate
     * @param {[ProblemOnah]} probOnahList
     */
    static getProbsForDate(jdate, probOnahList) {
        return (
            probOnahList &&
            probOnahList.length > 0 &&
            probOnahList.filter(po => Utils.isSameJdate(po.jdate, jdate))
        );
    }
    /**
     * Sort problems
     */
    static sortProbList(probOnahs) {
        //Sort problem onahs by chronological order, and return them
        return probOnahs.sort((a, b) => {
            if (a.jdate.Abs < b.jdate.Abs) {
                return -1;
            } else if (a.jdate.Abs > b.jdate.Abs) {
                return 1;
            } else {
                return a.nightDay - b.nightDay;
            }
        });
    }
}

/**
 * Represents a single flag for a single Onah.
 * Each Onah can have multiple flags.
 */
export class ProblemFlag {
    /**
     * @param {jDate} jdate
     * @param {NightDay} nightDay
     * @param {String} description
     */
    constructor(jdate, nightDay, description) {
        if (!jdate) {
            throw 'jdate must be supplied.';
        }
        if (!nightDay) {
            throw 'nightDay must be supplied.';
        }
        if (!description) {
            throw 'description must be supplied.';
        }
        this.jdate = jdate;
        this.nightDay = nightDay;
        this.description = description;
    }
    get onah() {
        return new Onah(this.jdate, this.nightDay);
    }
    /**
     * Tests to see if the given ProblemFlag matches this one.
     * @param {ProblemFlag} prob
     */
    isSameProb(prob) {
        return (
            Utils.isSameJdate(this.jdate, prob.jdate) &&
            this.nightDay === prob.nightDay &&
            this.description === prob.description
        );
    }
}
