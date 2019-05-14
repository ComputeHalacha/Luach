import DataUtils from './DataUtils';
import Settings from '../Settings';
import Entry from '../Chashavshavon/Entry';
import { Kavuah } from '../Chashavshavon/Kavuah';
import { NightDay } from '../Chashavshavon/Onah';
import EntryList from '../Chashavshavon/EntryList';
import Utils from '../JCal/Utils';
import {
    resetDayOnahReminders,
    resetNightOnahReminders,
} from '../Notifications';
import {
    log,
    error,
    warn,
    tryToGuessLocation,
    isFirstTimeRun,
    isEmpty,
} from '../GeneralUtils';
/**
 * List of fields that have been added after the initial app launch.
 * Any that do not yet exist, will be added to the db schema during initial loading.
 */
const addedFields = [
    //Added 5/10/17
    {
        table: 'settings',
        name: 'keepThirtyOne',
        type: 'BOOLEAN',
        allowNull: false,
        defaultValue: '1',
    },
    //Added 5/28/17
    {
        table: 'settings',
        name: 'showIgnoredKavuahs',
        type: 'BOOLEAN',
        allowNull: true,
    },
    //Added 6/1/17
    {
        table: 'entries',
        name: 'ignoreForKavuah',
        type: 'BOOLEAN',
        allowNull: true,
    },
    {
        table: 'entries',
        name: 'ignoreForFlaggedDates',
        type: 'BOOLEAN',
        allowNull: true,
    },
    {
        table: 'entries',
        name: 'comments',
        type: 'VARCHAR (500)',
        allowNull: true,
    },
    //Added 6/27/17
    {
        table: 'settings',
        name: 'haflagaOfOnahs',
        type: 'BOOLEAN',
        allowNull: true,
    },
    //Added 6/28/17
    {
        table: 'settings',
        name: 'noProbsAfterEntry',
        type: 'BOOLEAN',
        allowNull: true,
        defaultValue: '1',
    },
    //Added 6/29/17
    {
        table: 'settings',
        name: 'kavuahDiffOnahs',
        type: 'BOOLEAN',
        allowNull: true,
    },
    //Added 7/3/17
    {
        table: 'settings',
        name: 'hideHelp',
        type: 'BOOLEAN',
        allowNull: true,
    },
    //Added 8/8/17
    {
        table: 'occasions',
        name: 'color',
        type: 'VARCHAR (25)',
        allowNull: true,
    },
    //Added 5/9/19
    {
        table: 'settings',
        name: 'discreet',
        type: 'BOOLEAN',
        allowNull: true,
        defaultValue: '1',
    },
    //Added 5/13/19
    {
        table: 'settings',
        name: 'remindBedkMornTime',
        type: 'TIME',
        allowNull: true,
        defaultValue: '07:00:00',
    },
    //Added 5/13/19
    {
        table: 'settings',
        name: 'remindBedkAftrnHour',
        type: 'INT',
        allowNull: true,
        defaultValue: -1,
    },
    //Added 5/13/19
    {
        table: 'settings',
        name: 'remindMikvahTime',
        type: 'TIME',
        allowNull: true,
        defaultValue: '18:00:00',
    },
    //Added 5/13/19
    {
        table: 'settings',
        name: 'remindDayOnahHour',
        type: 'INT',
        allowNull: true,
        defaultValue: -8,
    },
    //Added 5/13/19
    {
        table: 'settings',
        name: 'remindNightOnahHour',
        type: 'INT',
        allowNull: true,
        defaultValue: -1,
    },
];

/**
 * An single object that contains all the application data.
 * Ideally, there should only be a single global instance of this class.
 */
export default class AppData {
    /**
     * @param {Settings} settings
     * @param {[UserOccasion]} occasions
     * @param {EntryList} entryList
     * @param {[Kavuah]} kavuahList
     * @param {[ProblemOnah]} problemOnahs
     * @param {[TaharaEvent]} taharaEvents
     */
    constructor(
        settings,
        occasions,
        entryList,
        kavuahList,
        problemOnahs,
        taharaEvents
    ) {
        this.Settings = settings || new Settings({});
        this.UserOccasions = occasions || [];
        this.EntryList = entryList || new EntryList();
        this.KavuahList = kavuahList || [];
        this.ProblemOnahs = problemOnahs || [];
        this.TaharaEvents = taharaEvents || [];
    }
    /**
     *  Calculates all the Entry Haflagas and Flagged Dates for this appData instance.
     */
    updateProbs() {
        this.EntryList.calculateHaflagas();
        let probs = [];
        if (this.EntryList.list.length > 0) {
            probs = this.EntryList.getProblemOnahs(
                this.KavuahList,
                this.Settings
            );
        }
        this.ProblemOnahs = probs;
    }
    /**
     * Returns the global appData object.
     * The first time this function is called, the global object is filled with the data from the local database file.
     */
    static async getAppData() {
        if (!global.GlobalAppData) {
            global.GlobalAppData = await AppData.fromDatabase();
            global.IsFirstRun = false;

            if (await isFirstTimeRun()) {
                const {
                    Settings,
                    EntryList,
                    KavuahList,
                    UserOccasions,
                    TaharaEvents,
                } = global.GlobalAppData;
                /***************
                 * In the sqlite database, the settings.location is set to Jerusalem.
                 * This is bad, as Jerusalem.Israel = true and most of our users are in the US and the UK.
                 * We can't overwrite the default database as all user data is stored in it.
                 * So we will try to determine if this is the first time the app was really ever run,
                 * and if so, change the default location to a guess based on the system time zone or else Lakewood NJ.
                 * We can't blindly rely on the firstTime function to determine if this is new launch
                 * as it was put into the code after many users had already installed the app.
                 * So in addition to the firstTime check, we look for default database conditions.
                 * This is that the location is Jerusalem and all other lists are empty.
                 ****************/
                log(`Initial Settings Location: ${Settings.location.Name}`);
                if (
                    Settings.location.locationId === 28 &&
                    !EntryList.list.length &&
                    !UserOccasions.length &&
                    !KavuahList.length &&
                    !TaharaEvents.length
                ) {
                    log(
                        'It has been determined that this is a first time launch. Trying to guess location'
                    );

                    const newLocation = await tryToGuessLocation();
                    await DataUtils.SetCurrentLocationOnDatabase(newLocation);
                    global.GlobalAppData.Settings.location = newLocation;
                    log(`Location has been set to: ${newLocation.Name}`);
                    //We will use this for the special welcome flash screen.
                    global.IsFirstRun = true;
                }
                log(`global.IsFirstRun has been set to: ${global.IsFirstRun}`);
            }
        }
        return global.GlobalAppData;
    }
    /**
     * Adds or removes the given item to the appropriate list in the global appData object.
     * The Entry Haflagas and Flagged Dates are then recalculated for the global appData object.
     * @param {Entry | Kavuah} item
     * @param {Boolean} remove
     */
    static updateGlobalProbs(item, remove) {
        AppData.getAppData().then(appData => {
            if (item) {
                if (!remove) {
                    if (item instanceof Entry) {
                        appData.EntryList.add(item);
                    } else if (item instanceof Kavuah) {
                        appData.KavuahList.push(item);
                    }
                } else {
                    if (item instanceof Entry) {
                        appData.EntryList.remove(item);
                    } else if (item instanceof Kavuah) {
                        let index = appData.KavuahList.indexOf(item);
                        if (index > -1) {
                            appData.KavuahList.splice(index, 1);
                        }
                    }
                }
            }
            appData.updateProbs(appData);
            if (
                !isEmpty(appData.Settings.remindDayOnahHour) ||
                !isEmpty(appData.Settings.remindNightOnahHour)
            ) {
                const now = Utils.nowAtLocation(appData.Settings.location);
                if (!isEmpty(appData.Settings.remindDayOnahHour)) {
                    resetDayOnahReminders(
                        appData.ProblemOnahs.filter(
                            po =>
                                po.NightDay === NightDay.Day &&
                                po.jdate.Abs >= now.Abs
                        ),
                        appData.Settings.remindDayOnahHour,
                        appData.Settings.location,
                        appData.Settings.discreet
                    );
                }
                if (!isEmpty(appData.Settings.remindNightOnahHour)) {
                    resetNightOnahReminders(
                        appData.ProblemOnahs.filter(
                            po =>
                                po.NightDay === NightDay.Day &&
                                po.jdate.Abs >= now.Abs
                        ),
                        appData.Settings.remindDayOnahHour,
                        appData.Settings.location,
                        appData.Settings.discreet
                    );
                }
            }
        });
    }
    /**
     * Update the schema of the local database file.
     * Any new fields that do not yet exist, will be added to the db schema.
     */
    static async upgradeDatabase() {
        //First get a list of tables that may need updating.
        const tablesToChange = [];
        for (let af of addedFields) {
            if (!tablesToChange.includes(af.table)) {
                tablesToChange.push(af.table);
            }
        }
        for (let tbl of tablesToChange) {
            //Get the new fields for this table.
            const newFields = addedFields.filter(af => af.table === tbl),
                fields = await DataUtils.GetTableFields(tbl);

            for (let nf of newFields) {
                if (!fields.some(f => f.name === nf.name)) {
                    //Add any new fields that were added after the last update.
                    await DataUtils.AddTableField(nf);
                }
            }
        }
    }
    /**
     * Returns an appData instance containing all the user data from the local database file.
     */
    static async fromDatabase() {
        let settings,
            occasions,
            entryList,
            kavuahList,
            problemOnahs,
            taharaEvents;

        //Before getting data from database, make sure that the local database schema is up to date.
        await AppData.upgradeDatabase();

        settings = await DataUtils.SettingsFromDatabase().catch(err => {
            warn('Error running SettingsFromDatabase.');
            error(err);
        });
        occasions = await DataUtils.GetAllUserOccasions().catch(err => {
            warn('Error running GetAllUserOccasions.');
            error(err);
        });
        entryList = await DataUtils.EntryListFromDatabase().catch(err => {
            warn('Error running EntryListFromDatabase.');
            error(err);
        });
        kavuahList = await DataUtils.GetAllKavuahs(entryList).catch(err => {
            warn('Error running GetAllKavuahs.');
            error(err);
        });
        taharaEvents = await DataUtils.GetAllTaharaEvents().catch(err => {
            warn('Error running GetAllTaharaEvents.');
            error(err);
        });

        //After getting all the data, the problem onahs are set.
        problemOnahs = entryList.getProblemOnahs(kavuahList, settings);

        return new AppData(
            settings,
            occasions,
            entryList,
            kavuahList,
            problemOnahs,
            taharaEvents
        );
    }
}
