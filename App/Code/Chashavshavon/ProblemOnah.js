import Onah from './Onah';
import NightDay from './NightDay';

export default class ProblemOnah extends Onah {
    constructor(jdate, nightDay, name) {
        if (!jdate) {
            throw 'jdate must be supplied.'
        }
        super(jdate, nightDay);
        this.name = name;
    }
    toString() {
        return `The ${this.nightDay === NightDay.Night ? 'night' : 'day'} of ${this.jdate.toString()} is the ${this.name}`;
    }
}