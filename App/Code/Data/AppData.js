import DataUtils from './DataUtils';

export default class AppData {
    constructor(settings, entryList, kavuahList, problemEntries) {
        this.Settings = settings;
        this.EntryList = entryList;
        this.KavuahList = kavuahList;
        this.ProblemEntries = problemEntries;
    }
    static async getAppData() {
        if (!global.AppData) {
            await AppData.fromDatabase().then(ad => {
                global.AppData = ad;
            });
        }
        return global.AppData;
    }
    static async fromDatabase() {
        let settings, entryList, kavuahList, problemEntries;

        await DataUtils.SettingsFromDatabase()
            .then(s => settings = s)
            .catch(error => {
                console.warn(`Error running SettingsFromDatabase.`);
                console.error(error);
            });
        await DataUtils.EntryListFromDatabase(settings)
            .then(e => entryList = e)
            .catch(error => {
                console.warn(`Error running EntryListFromDatabase.`);
                console.error(error);
            });
        await DataUtils.GetAllKavuahs(entryList)
            .then(k => {
                kavuahList = k;
                problemEntries = entryList.getProblemOnahs(kavuahList);
            })
            .catch(error => {
                console.warn(`Error running GetAllKavuahs.`);
                console.error(error);
            });

        return new AppData(settings, entryList, kavuahList, problemEntries);
    }
}