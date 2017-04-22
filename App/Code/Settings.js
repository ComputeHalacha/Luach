import Location from './JCal/Location';
import { setDefault } from './GeneralUtils';
import DataUtils from './Data/DataUtils';

export default class Settings {
    constructor(args) {
        this.location = args.location || Location.getJerusalem();
        this.showOhrZeruah = setDefault(args.showOhrZeruah, true);
        this.onahBeinunis24Hours = !!args.onahBeinunis24Hours;
        this.numberMonthsAheadToWarn = setDefault(args.numberMonthsAheadToWarn, 12);
        this.keepLongerHaflagah = !!args.keepLongerHaflagah;
        this.cheshbonKavuahByActualEntry = setDefault(args.cheshbonKavuahByActualEntry, true);
        this.cheshbonKavuahByCheshbon = setDefault(args.cheshbonKavuahByCheshbon, true);
        this.calcKavuahsOnNewEntry = setDefault(args.calcKavuahsOnNewEntry, true);
        this.showProbFlagOnHome = setDefault(args.showProbFlagOnHome, true);
        this.showEntryFlagOnHome = setDefault(args.showEntryFlagOnHome, true);
        this.requirePIN = !!args.requirePIN;
        this.PIN = setDefault(args.PIN, '1234');
    }
    save() {
        DataUtils.SettingsToDatabase(this);
    }
}