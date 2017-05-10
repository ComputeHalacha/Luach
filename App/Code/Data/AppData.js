import DataUtils from './DataUtils';
import Settings from '../Settings';
import EntryList from '../Chashavshavon/EntryList';

/**
 * This is a list of new setting fields that have been added after the initial launch.
 * These will be added to the schema during HomeScreen initial load - if they do not exist.
 */
const addedSettingsFields = [
    {
        name: 'keepThirtyOne', type: 'BOOLEAN', allowNull: false, defaultValue: '1'
    }];


export default class AppData {
    /**
     * @param {Settings} settings
     * @param {[UserOccasion]} occasions
     * @param {EntryList} entryList
     * @param {[Kavuah]} kavuahList
     * @param {[ProblemOnah]} problemOnahs
     */
    constructor(settings, occasions, entryList, kavuahList, problemOnahs) {
        this.Settings = settings || new Settings({});
        this.UserOccasions = occasions || [];
        this.EntryList = entryList || new EntryList(this.Settings);
        this.KavuahList = kavuahList || [];
        this.ProblemOnahs = problemOnahs || [];
    }
    static async getAppData() {
        if (!global.GlobalAppData) {
            await AppData.fromDatabase().then(ad => {
                global.GlobalAppData = ad;
            });
        }
        return global.GlobalAppData;
    }
    static setAppData(ad) {
        global.GlobalAppData = ad;
    }
    static upgradeDatabase() {
        DataUtils.GetTableFields('settings').then(fields => {
            for (let asf of addedSettingsFields) {
                if (!fields.some(f => f.name === asf.name)) {
                    DataUtils.AddSettingsField(asf);
                }
            }
        });
    }
    static async fromDatabase() {
        let settings, occasions, entryList, kavuahList, problemOnahs;
        await DataUtils.SettingsFromDatabase()
            .then(s => settings = s)
            .catch(error => {
                if (__DEV__) {
                    console.warn('Error running SettingsFromDatabase.');
                    console.error(error);
                }
            });
        await DataUtils.GetAllUserOccasions()
            .then(ol => {
                occasions = ol;
            })
            .catch(error => {
                if (__DEV__) {
                    console.warn('Error running GetAllUserOccasions.');
                    console.error(error);
                }
            });
        await DataUtils.EntryListFromDatabase(settings)
            .then(e => entryList = e)
            .catch(error => {
                if (__DEV__) {
                    console.warn('Error running EntryListFromDatabase.');
                    console.error(error);
                }
            });
        await DataUtils.GetAllKavuahs(entryList)
            .then(k => {
                kavuahList = k;
                problemOnahs = entryList.getProblemOnahs(kavuahList);
            })
            .catch(error => {
                if (__DEV__) {
                    console.warn('Error running GetAllKavuahs.');
                    console.error(error);
                }
            });

        return new AppData(settings, occasions, entryList, kavuahList, problemOnahs);
    }
}