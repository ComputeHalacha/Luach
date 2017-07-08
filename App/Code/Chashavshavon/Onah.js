import jDate from '../JCal/jDate';
import Utils from '../JCal/Utils';

const NightDay = Object.freeze({
    Night: -1,
    Day: 1
});
/**
 * Represents either the night-time or the day-time sof a single Jewish Date.
 */
class Onah {
    /**
     * @param {jDate} jdate
     * @param {Number} nightDay
     */
    constructor(jdate, nightDay) {
        if (!(jdate instanceof jDate)) {
            throw 'jdate must be supplied.';
        }
        if (![NightDay.Day, NightDay.Night].includes(nightDay)) {
            throw 'nightDay must be supplied.';
        }
        this.jdate = jdate;
        this.nightDay = nightDay;
    }
    /**
     * Determines if the supplied Onah has the same Jewish date and Night/Day as the current Onah.
     * @param {Onah} onah
     */
    isSameOnah(onah) {
        return Utils.isSameJdate(this.jdate, onah.jdate) &&
            this.nightDay === onah.nightDay;
    }
    /**
     * Add the given number of Onahs to the current one
     * @param {Number} number - if it is negative will get an earlier onah
     */
    addOnahs(number) {
        if (!number) {
            return this;
        }

        //First add the full days. Each day is 2 onahs.
        const fullDays = Utils.toInt(number / 2);
        let onah = new Onah(this.jdate.addDays(fullDays), this.nightDay);
        number -= (fullDays * 2);
        while (number > 0) {
            onah = (number > 0 ? onah.next : onah.previous);
            number--;
        }
        return onah;
    }
    /**
     * Returns the Onah directly before to this one.
     */
    get previous() {
        if (this.nightDay === NightDay.Day) {
            return new Onah(this.jdate, NightDay.Night);
        }
        else {
            return new Onah(this.jdate.addDays(-1), NightDay.Day);
        }
    }
    /**
     * Returns the Onah directly after this one.
     */
    get next() {
        if (this.nightDay === NightDay.Day) {
            return new Onah(this.jdate.addDays(1), NightDay.Night);
        }
        else {
            return new Onah(this.jdate, NightDay.Day);
        }
    }
}

export { NightDay, Onah };