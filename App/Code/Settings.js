import Location from './JCal/Location'
import DataUtils from './Data/DataUtils';
import { isNumber, setDefault } from './GeneralUtils';
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
    static async fromDatabase() {
        let settings;
        await DataUtils.executeSql(`SELECT * from settings`)
            .then(results => {
                const dbSet = results[0];
                settings = new Settings(
                    Location.fromDatabase(dbSet.locationId),
                    dbSet.showOhrZeruah,
                    dbSet.onahBeinunis24Hours,
                    dbSet.numberMonthsAheadToWarn,
                    dbSet.keepLongerHaflagah,
                    dbSet.cheshbonKavuahByActualEntry,
                    dbSet.cheshbonKavuahByCheshbon);
            })
            .catch(error => {
                console.warn(`Error trying to get settings from the database.`);
                console.error(error);
            });
        return settings;
    }
}