import JDate from '../JCal/jDate';
import Onah from './Onah';
import NightDay from './NightDay';

export default class FullDay extends JDate {
    constructor(arg, month, day, abs) {
        super(arg, month, day, abs);
        this.day = new Onah(this, NightDay.Night);
        this.night = new Onah(this, NightDay.Day);
    }
}