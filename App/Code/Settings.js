import Location from './JCal/Location';
import { setDefault } from './GeneralUtils';
import DataUtils from './Data/DataUtils';

export default class Settings {
    constructor(location, showOhrZeruah, onahBeinunis24Hours, numberMonthsAheadToWarn, keepLongerHaflagah, cheshbonKavuahByActualEntry, cheshbonKavuahByCheshbon) {
        this.location = location || Location.getJerusalem();
        this.showOhrZeruah = setDefault(showOhrZeruah, true);
        this.onahBeinunis24Hours = !!onahBeinunis24Hours;
        this.numberMonthsAheadToWarn = setDefault(numberMonthsAheadToWarn, 12);
        this.keepLongerHaflagah = !!keepLongerHaflagah;
        this.cheshbonKavuahByActualEntry = setDefault(cheshbonKavuahByActualEntry, true);
        this.cheshbonKavuahByCheshbon = setDefault(cheshbonKavuahByCheshbon, true);
    }
    save() {
        DataUtils.SettingsToDatabase(this);
    }
}