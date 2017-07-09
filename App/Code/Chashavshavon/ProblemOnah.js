import { NightDay, Onah } from './Onah';
import Utils from  '../JCal/Utils';

export default class ProblemOnah extends Onah {
    constructor(jdate, nightDay, name) {
        if (!jdate) {
            throw 'jdate must be supplied.';
        }
        super(jdate, nightDay);
        this.name = name;
    }
    toString() {
        const goyDate = this.nightDay === NightDay.Night ?
            this.jdate.addDays(-1).getDate() : this.jdate.getDate();
        return `The ${this.nightDay === NightDay.Night ? 'night' : 'day'} of ` +
            this.jdate.toString() +
            ` (${goyDate.toLocaleDateString()}) is the:\n ► ${this.name}`;
    }
    isSameProb(prob) {
        return this.isSameOnah(prob) && this.name === prob.name;
    }
    /**
     * Filter a list of problem onahs for the ones pertaining to the given date.
     * @param {JDate} jdate
     * @param {[ProblemOnah]} probOnahList
     */
    static getProbsForDate(jdate, probOnahList) {
        return probOnahList && probOnahList.length > 0 && probOnahList.filter(po =>
            Utils.isSameJdate(po.jdate, jdate));
    }
}