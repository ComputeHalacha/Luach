import jDate from '../JCal/jDate';

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
        return this.jdate.Abs === onah.jdate.Abs &&
            this.nightDay === onah.nightDay;
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
            return new Onah(this.jdate, NightDay.Night);
        }
    }
}

export { NightDay, Onah };