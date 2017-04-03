import DataUtils from './DataUtils';

export default class AppData {
    constructor(locations, settings, entryList, kavuahList, problemOnahs) {
        this.Locations = locations;
        this.Settings = settings;
        this.EntryList = entryList;
        this.KavuahList = kavuahList;
        this.ProblemOnahs = problemOnahs;
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
        let locations, settings, entryList, kavuahList, problemOnahs;
        await DataUtils.GetAllLocations()
            .then(async l => {
                locations = l;
                await DataUtils.SettingsFromDatabase(locations)
                    .then(s => settings = s)
                    .catch(error => {
                        console.warn(`Error running SettingsFromDatabase.`);
                        console.error(error);
                    });
            })
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
                problemOnahs = entryList.getProblemOnahs(kavuahList);
            })
            .catch(error => {
                console.warn(`Error running GetAllKavuahs.`);
                console.error(error);
            });

        return new AppData(locations, settings, entryList, kavuahList, problemOnahs);
    }
}