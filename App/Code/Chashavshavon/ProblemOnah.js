import Onah from './Onah';

export default class ProblemOnah extends Onah {
    constructor(jdate, nightDay, name) {
        super(jdate, nightDay);
        this.name = name;
    }
}