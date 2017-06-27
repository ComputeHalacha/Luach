import Location from './JCal/Location';
import { setDefault } from './GeneralUtils';
import DataUtils from './Data/DataUtils';

export default class Settings {
    constructor(args) {
        this.location = args.location || Location.getLakewood();
        this.showOhrZeruah = setDefault(args.showOhrZeruah, true);
        this.keepThirtyOne = setDefault(args.keepThirtyOne, true);
        this.onahBeinunis24Hours = !!args.onahBeinunis24Hours;
        this.numberMonthsAheadToWarn = setDefault(args.numberMonthsAheadToWarn, 12);
        this.keepLongerHaflagah = !!args.keepLongerHaflagah;
        this.cheshbonKavuahByActualEntry = setDefault(args.cheshbonKavuahByActualEntry, true);
        this.cheshbonKavuahByCheshbon = setDefault(args.cheshbonKavuahByCheshbon, true);
        this.kavuahHaflagaOnahs = !!args.kavuahHaflagaOnahs;
        this.calcKavuahsOnNewEntry = setDefault(args.calcKavuahsOnNewEntry, true);
        this.showProbFlagOnHome = setDefault(args.showProbFlagOnHome, true);
        this.showEntryFlagOnHome = setDefault(args.showEntryFlagOnHome, true);
        this.navigateBySecularDate = !!args.navigateBySecularDate;
        this.showIgnoredKavuahs = !!args.showIgnoredKavuahs;
        this.requirePIN = !!args.requirePIN;
        this.PIN = setDefault(args.PIN, '1234');
    }
    save() {
        DataUtils.SettingsToDatabase(this);
    }
    isSameSettings(other) {
        if (!!this != !!other) {
            return false;
        }
        return (!this && !other) || (this.location === other.location &&
            this.showOhrZeruah === other.showOhrZeruah &&
            this.keepThirtyOne === other.keepThirtyOne &&
            this.onahBeinunis24Hours === other.onahBeinunis24Hours &&
            this.numberMonthsAheadToWarn === other.numberMonthsAheadToWarn &&
            this.keepLongerHaflagah === other.keepLongerHaflagah &&
            this.cheshbonKavuahByActualEntry === other.cheshbonKavuahByActualEntry &&
            this.cheshbonKavuahByCheshbon === other.cheshbonKavuahByCheshbon &&
            this.kavuahHaflagaOnahs === other.kavuahHaflagaOnahs &&
            this.calcKavuahsOnNewEntry === other.calcKavuahsOnNewEntry &&
            this.showProbFlagOnHome === other.showProbFlagOnHome &&
            this.showEntryFlagOnHome === other.showEntryFlagOnHome &&
            this.navigateBySecularDate === other.navigateBySecularDate &&
            this.showIgnoredKavuahs === other.showIgnoredKavuahs &&
            this.requirePIN === other.requirePIN &&
            this.PIN === other.PIN);
    }
}