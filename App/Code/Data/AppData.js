import DataUtils from './DataUtils';
import Settings from '../Settings';
import Entry from '../Chashavshavon/Entry';
import { Kavuah } from '../Chashavshavon/Kavuah';
import EntryList from '../Chashavshavon/EntryList';
import { error, warn } from '../GeneralUtils';

/**
 * List of fields that have been added after the initial app launch.
 * Any that do not yet exist, will be added to the db schema during initial loading.
 */
const addedFields = [
    //Added 5/10/17
    { table: 'settings', name: 'keepThirtyOne', type: 'BOOLEAN', allowNull: false, defaultValue: '1' },
    //Added 5/28/17
    { table: 'settings', name: 'showIgnoredKavuahs', type: 'BOOLEAN', allowNull: true },
    //Added 6/1/17
    { table: 'entries', name: 'ignoreForKavuah', type: 'BOOLEAN', allowNull: true },
    { table: 'entries', name: 'ignoreForFlaggedDates', type: 'BOOLEAN', allowNull: true },
    { table: 'entries', name: 'comments', type: 'VARCHAR (500)', allowNull: true },
    //Added 6/27/17
    { table: 'settings', name: 'haflagaOfOnahs', type: 'BOOLEAN', allowNull: true },
    //Added 6/28/17
    { table: 'settings', name: 'noProbsAfterEntry', type: 'BOOLEAN', allowNull: true, defaultValue: '1' },
    //Added 6/29/17
    { table: 'settings', name: 'kavuahDiffOnahs', type: 'BOOLEAN', allowNull: true },
    //Added 7/3/17
    { table: 'settings', name: 'hideHelp', type: 'BOOLEAN', allowNull: true },
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
        this.EntryList = entryList || new EntryList();
        this.KavuahList = kavuahList || [];
        this.ProblemOnahs = problemOnahs || [];
    }
    updateProbs() {
        this.EntryList.calulateHaflagas();
        let probs = [];
        if (this.EntryList.list.length > 0) {
            probs = this.EntryList.getProblemOnahs(this.KavuahList, this.Settings);
        }
        this.ProblemOnahs = probs;
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
    /**
     *
     * @param {Entry | Kavuah} item
     * @param {Boolean} remove
     */
    static updateGlobalProbs(item, remove) {
        AppData.getAppData().then(appData => {
            if (item) {
                if (!remove) {
                    if (item instanceof Entry) {
                        appData.EntryList.add(item);
                    }
                    else if (item instanceof Kavuah) {
                        appData.KavuahList.push(item);
                    }
                }
                else {
                    if (item instanceof Entry) {
                        appData.EntryList.remove(item);
                    }
                    else if (item instanceof Kavuah) {
                        let index = appData.KavuahList.indexOf(item);
                        if (index > -1) {
                            appData.KavuahList.splice(index, 1);
                        }
                    }
                }
            }
            appData.updateProbs(appData);
        });
    }
    /**
     * Update the schema of the local database file.
     * Any new fields that do not yet exist, will be added to the db schema.
     */
    static upgradeDatabase() {
        //First get a list of tables that may need updating.
        const tablesToChange = [];
        for (let af of addedFields) {
            if (!tablesToChange.includes(af.table)) {
                tablesToChange.push(af.table);
            }
        }
        for (let tbl of tablesToChange) {
            //Get the new fields for this table.
            const newFields = addedFields.filter(af => af.table === tbl);
            //Add any new fields that were added after the last update.
            DataUtils.GetTableFields(tbl)
                .then(fields => {
                    for (let nf of newFields) {
                        if (!fields.some(f => f.name === nf.name)) {
                            DataUtils.AddTableField(nf);
                        }
                    }
                });
        }
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
        await DataUtils.EntryListFromDatabase()
            .then(e => entryList = e)
            .catch(err => {
                warn('Error running EntryListFromDatabase.');
                error(err);
            });
        await DataUtils.GetAllKavuahs(entryList)
            .then(k => {
                kavuahList = k;
                //After getting all the data, the problem onahs are set.
                problemOnahs = entryList.getProblemOnahs(kavuahList, settings);
            })
            .catch(err => {
                warn('Error running GetAllKavuahs.');
                error(err);
            });

        return new AppData(settings, occasions, entryList, kavuahList, problemOnahs);
    }
}