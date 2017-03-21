import Onah from './Onah.js';
export default class Entry {
    constructor(onah, haflaga) {
        this.onah = onah;
        if (haflaga instanceof Entry) {
            //The previous entry was supplied
            this.haflaga = haflaga.onah.jdate.diffDays(this.onah.jdate) + 1;
        }
        else {
            this.haflaga = haflaga;
        }
        this.active = true;
    }
    isSameEntry(entry) {
        return this.onah.isSameOnah(entry.Onah) &&
            this.haflaga === entry.haflaga &&
            this.active === entry.active;
    }
}