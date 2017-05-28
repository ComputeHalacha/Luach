import DataUtils from './DataUtils';
import Settings from '../Settings';
import EntryList from '../Chashavshavon/EntryList';
import { error, warn } from '../GeneralUtils';

/**
 * List of setting fields that have been added after the initial app launch.
 * Any that do not yet exist, will be added to the db schema during initial loading.
 */
const addedSettingsFields = [
    //Added 5/10/17
    { name: 'keepThirtyOne', type: 'BOOLEAN', allowNull: false, defaultValue: '1' },
    //Added 5/28/17
    { name: 'showIgnoredKavuahs', type: 'BOOLEAN', allowNull: true },
];

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
        //Add any new settings that were added after the last update.
        DataUtils.GetTableFields('settings')
            .then(fields => {
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
            .catch(err => {
                warn('Error running SettingsFromDatabase.');
                error(err);
            });
        await DataUtils.GetAllUserOccasions()
            .then(ol => {
                occasions = ol;
            })
            .catch(err => {
                warn('Error running GetAllUserOccasions.');
                error(err);
            });
        await DataUtils.EntryListFromDatabase(settings)
            .then(e => entryList = e)
            .catch(err => {
                warn('Error running EntryListFromDatabase.');
                error(err);
            });
        await DataUtils.GetAllKavuahs(entryList)
            .then(k => {
                kavuahList = k;
                problemOnahs = entryList.getProblemOnahs(kavuahList);
            })
            .catch(err => {
                warn('Error running GetAllKavuahs.');
                error(err);
            });

        return new AppData(settings, occasions, entryList, kavuahList, problemOnahs);
    }
}