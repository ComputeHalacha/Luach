import SQLite from 'react-native-sqlite-storage';
import { isNumber, log, error, warn } from '../GeneralUtils';
import AppData from './AppData';
import jDate from '../JCal/jDate';
import Settings from '../Settings';
import Location from '../JCal/Location';
import { UserOccasion } from '../JCal/UserOccasion';
import Entry from '../Chashavshavon/Entry';
import EntryList from '../Chashavshavon/EntryList';
import { NightDay, Onah } from '../Chashavshavon/Onah';
import { Kavuah } from '../Chashavshavon/Kavuah';

SQLite.DEBUG(!!__DEV__);
SQLite.enablePromise(true);

export default class DataUtils {
    static async SettingsFromDatabase() {
        let settings;
        await DataUtils._executeSql('SELECT * from settings')
            .then(async results => {
                const dbSet = results.list[0],
                    location = await DataUtils.LocationFromDatabase(dbSet.locationId);
                settings = new Settings({
                    location: location,
                    showOhrZeruah: dbSet.showOhrZeruah,
                    keepThirtyOne: dbSet.keepThirtyOne,
                    onahBeinunis24Hours: dbSet.onahBeinunis24Hours,
                    numberMonthsAheadToWarn: dbSet.numberMonthsAheadToWarn,
                    keepLongerHaflagah: dbSet.keepLongerHaflagah,
                    cheshbonKavuahByCheshbon: dbSet.cheshbonKavuahByCheshbon,
                    haflagaOfOnahs: dbSet.haflagaOfOnahs,
                    kavuahDiffOnahs: dbSet.kavuahDiffOnahs,
                    calcKavuahsOnNewEntry: dbSet.calcKavuahsOnNewEntry,
                    showProbFlagOnHome: dbSet.showProbFlagOnHome,
                    showEntryFlagOnHome: dbSet.showEntryFlagOnHome,
                    navigateBySecularDate: dbSet.navigateBySecularDate,
                    showIgnoredKavuahs: dbSet.showIgnoredKavuahs,
                    noProbsAfterEntry: dbSet.noProbsAfterEntry,
                    hideHelp:dbSet.hideHelp,
                    requirePIN: dbSet.requirePIN,
                    PIN: dbSet.PIN
                });
            })
            .catch(err => {
                warn('Error trying to get settings from the database.');
                error(err);
            });
        return settings;
    }
    static async SettingsToDatabase(settings) {
        await DataUtils._executeSql(`UPDATE settings SET
            locationId=?,
            showOhrZeruah=?,
            keepThirtyOne=?,
            onahBeinunis24Hours=?,
            numberMonthsAheadToWarn=?,
            keepLongerHaflagah=?,
            cheshbonKavuahByCheshbon=?,
            haflagaOfOnahs=?,
            kavuahDiffOnahs=?,
            calcKavuahsOnNewEntry=?,
            showProbFlagOnHome=?,
            showEntryFlagOnHome=?,
            navigateBySecularDate=?,
            showIgnoredKavuahs=?,
            noProbsAfterEntry=?,
            hideHelp=?,
            requirePIN=?,
            PIN=?`,
            [
                //Lakewood is the default - locationId: 185
                (settings.location && settings.location.locationId) || 185,
                settings.showOhrZeruah,
                settings.keepThirtyOne,
                settings.onahBeinunis24Hours,
                settings.numberMonthsAheadToWarn,
                settings.keepLongerHaflagah,
                settings.cheshbonKavuahByCheshbon,
                settings.haflagaOfOnahs,
                settings.kavuahDiffOnahs,
                settings.calcKavuahsOnNewEntry,
                settings.showProbFlagOnHome,
                settings.showEntryFlagOnHome,
                settings.navigateBySecularDate,
                settings.showIgnoredKavuahs,
                settings.noProbsAfterEntry,
                settings.hideHelp,
                settings.requirePIN,
                settings.PIN
            ])
            .then(() => AppData.updateGlobalProbs())
            .catch(err => {
                warn('Error trying to enter settings into the database.');
                error(err);
            });
    }
    static async EntryListFromDatabase() {
        const entryList = new EntryList();
        await DataUtils._executeSql('SELECT * from entries ORDER BY dateAbs, day')
            .then(results => {
                if (results.list.length > 0) {
                    for (let e of results.list) {
                        const onah = new Onah(new jDate(e.dateAbs), e.day ? NightDay.Day : NightDay.Night);
                        entryList.add(new Entry(
                            onah,
                            e.entryId,
                            e.ignoreForFlaggedDates,
                            e.igignoreForKavuah,
                            e.comments));
                    }
                    entryList.calulateHaflagas();
                }
            })
            .catch(err => {
                warn('Error trying to get all entries from the database.');
                error(err);
            });
        return entryList;
    }
    static async LocationFromDatabase(locationId) {
        let location = null;
        if (!locationId) {
            throw 'LocationId parameter cannot be empty. Use GetAllLocations to retrieve all locations.';
        }
        await DataUtils._queryLocations('locationId=?', [locationId]).then(ls => {
            if (ls.length > 0) {
                location = ls[0];
            }
        });
        return location;
    }
    /** Returns a list of Location objects that match the search query with all the locations in the database.*/
    static async GetAllLocations() {
        return await DataUtils._queryLocations();
    }
    /**
     * Returns a list of the Location objects in the database that their name or heb values contain the search term.
     * The search is not case sensitive.
     * @param {String} search
     * @returns {<[Location]>}
     */
    static async SearchLocations(search) {
        if (!search) {
            throw 'Search parameter cannot be empty. Use GetAllLocations to retrieve all locations.';
        }
        return await DataUtils._queryLocations('name || IFNULL(heb, \'\') LIKE ?', [`%${search}%`]);
    }
    static async GetAllUserOccasions() {
        let list = [];
        await DataUtils._executeSql('SELECT * from occasions')
            .then(results => {
                list = results.list.map(o => new UserOccasion(o.title,
                    o.type,
                    o.dateAbs,
                    o.comments,
                    o.occasionId));
            })
            .catch(err => {
                warn('Error trying to get all occasions from the database.');
                error(err);
            });
        return list;
    }
    static async UserOccasionToDatabase(occasion) {
        const params = [
            occasion.title,
            occasion.occasionType,
            occasion.dateAbs,
            occasion.comments
        ];
        if (occasion.hasId) {
            await DataUtils._executeSql(`UPDATE occasions SET
                    title=?,
                    type=?,
                    dateAbs=?,
                    comments=?
                WHERE occasionId=?`,
                [...params, occasion.occasionId])
                .then(() => {
                    log(`Updated Occasion Id ${occasion.occasionId.toString()}`);
                })
                .catch(err => {
                    warn(`Error trying to update Occasion Id ${occasion.occasionId.toString()} to the database.`);
                    error(err);
                });
        }
        else {
            await DataUtils._executeSql(`INSERT INTO occasions (
                        title,
                        type,
                        dateAbs,
                        comments)
                    VALUES (?,?,?,?)`,
                params)
                .then(results => occasion.occasionId = results.id)
                .catch(err => {
                    warn('Error trying to insert occasion into the database.');
                    error(err);
                });
        }
    }
    static async DeleteUserOccasion(occasion) {
        if (!occasion.hasId) {
            throw 'Occasions can only be deleted from the database if they have an id';
        }
        await DataUtils._executeSql('DELETE from occasions where occasionId=?', [occasion.occasionId])
            .catch(err => {
                warn(`Error trying to delete occasion id ${occasion.occasionId} from the database`);
                error(err);
            });
    }

    /**
     * Gets all Kavuahs from the database.
     * @param {Entry|[Entry]} entries An EntryList instance or an Array of entries where the settingEntry can be found
     */
    static async GetAllKavuahs(entries) {
        if (entries instanceof EntryList) {
            entries = entries.list;
        }
        let list = [];
        //DataUtils._executeSql('DELETE from kavuahs');
        await DataUtils._executeSql('SELECT * from kavuahs')
            .then(results => {
                list = results.list.map(k => new Kavuah(k.kavuahType,
                    k.settingEntry = entries.find(e => e.entryId === k.settingEntryId),
                    k.specialNumber,
                    !!k.cancelsOnahBeinunis,
                    !!k.active,
                    !!k.ignore,
                    k.kavuahId));
            })
            .catch(err => {
                warn('Error trying to get all kavuahs from the database.');
                error(err);
            });
        return list;
    }
    static async KavuahToDatabase(kavuah) {
        if (!(kavuah.settingEntry && kavuah.settingEntry.hasId)) {
            throw 'A kavuah can not be saved to the database unless it\'s setting entry is already in the database.';
        }
        const params = [
            kavuah.kavuahType,
            kavuah.settingEntry.entryId,
            kavuah.specialNumber,
            kavuah.cancelsOnahBeinunis,
            kavuah.active,
            kavuah.ignore];

        if (kavuah.hasId) {
            await DataUtils._executeSql(`UPDATE kavuahs SET
                    kavuahType=?,
                    settingEntryId=?,
                    specialNumber=?,
                    cancelsOnahBeinunis=?,
                    active=?,
                    [ignore]=?
                WHERE kavuahId=?`,
                [...params, kavuah.kavuahId])
                .then(() => {
                    log(`Updated Kavuah Id ${kavuah.kavuahId.toString()}`);
                    AppData.updateGlobalProbs();
                })
                .catch(err => {
                    warn(`Error trying to update Kavuah Id ${kavuah.kavuahId.toString()} to the database.`);
                    error(err);
                });
        }
        else {
            await DataUtils._executeSql(`INSERT INTO kavuahs (
                        kavuahType,
                        settingEntryId,
                        specialNumber,
                        cancelsOnahBeinunis,
                        active,
                        [ignore])
                    VALUES (?,?,?,?,?,?)`,
                params)
                .then(results => {
                    kavuah.kavuahId = results.id;
                    AppData.updateGlobalProbs(kavuah);
                })
                .catch(err => {
                    warn('Error trying to insert kavuah into the database.');
                    error(err);
                });
        }
    }
    static async DeleteKavuah(kavuah) {
        if (!kavuah.hasId) {
            throw 'Kavuahs can only be deleted from the database if they have an id';
        }
        await DataUtils._executeSql('DELETE from kavuahs where kavuahId=?', [kavuah.kavuahId])
            .then(() => AppData.updateGlobalProbs(kavuah, true))
            .catch(err => {
                warn(`Error trying to delete kavuah id ${kavuah.kavuahId} from the database`);
                error(err);
            });
    }
    static async EntryToDatabase(entry) {
        if (entry.hasId) {
            await DataUtils._executeSql('UPDATE entries SET dateAbs=?, day=?, ignoreForFlaggedDates=?, ignoreForKavuah=?, comments=? WHERE entryId=?',
                [
                    entry.date.Abs,
                    entry.nightDay === NightDay.Day,
                    entry.ignoreForFlaggedDates,
                    entry.ignoreForKavuah,
                    entry.comments,
                    entry.entryId
                ])
                .then(() => {
                    log(`Updated Entry Id ${entry.entryId.toString()}`);
                    AppData.updateGlobalProbs();
                })
                .catch(err => {
                    warn(`Error trying to update entry id ${entry.entryId.toString()} to the database.`);
                    error(err);
                });
        }
        else {
            await DataUtils._executeSql('INSERT INTO entries (dateAbs, day, ignoreForFlaggedDates, ignoreForKavuah, comments) VALUES (?, ?, ?, ?, ?)',
                [
                    entry.date.Abs,
                    entry.nightDay === NightDay.Day,
                    entry.ignoreForFlaggedDates,
                    entry.ignoreForKavuah,
                    entry.comments
                ])
                .then(results => {
                    entry.entryId = results.id;
                    AppData.updateGlobalProbs(entry);
                })
                .catch(err => {
                    warn('Error trying to insert entry into the database.');
                    error(err);
                });
        }
    }
    static async DeleteEntry(entry) {
        if (!entry.hasId) {
            throw 'Entries can only be deleted from the database if they have an id';
        }
        await DataUtils._executeSql('DELETE from entries where entryId=?', [entry.entryId])
            .then(() => AppData.updateGlobalProbs(entry, true))
            .catch(err => {
                warn(`Error trying to delete entry id ${entry.entryId} from the database`);
                error(err);
            });
    }
    /**
     * Retrieve the table schema. Each of the returned rows represents a single column of the table.
     * The fields returned by sqlite for this query are: cid, name, type, notnull, dflt_value, pk.
     * @param {String} tableName
     */
    static async GetTableFields(tableName) {
        let list = [];
        await DataUtils._executeSql(`PRAGMA table_info(${tableName})`)
            .then(results => list = results.list)
            .catch(err => {
                warn(`Error trying to get fields of ${tableName} table from the database`);
                error(err);
            });
        return list;
    }
    /**
     * Add a new table field.
     * @param {{table:String, name:String, type:String, allowNull:Boolean, defaultValue:String}} newField
     */
    static async AddTableField(newField) {
        await DataUtils._executeSql(`ALTER TABLE ${newField.table}
            ADD COLUMN ${newField.name}
                ${newField.type}
                ${newField.allowNull ? '' : 'NOT '} NULL
                ${newField.defaultValue ? 'DEFAULT ' + newField.defaultValue : ''}`)
            .catch(err => {
                warn(`Error trying to add the field "${newField.name}" to the "${newField.table}" table`);
                error(err);
            });
    }
    /**
     * Queries the locations table of the local sqlite database, and returns a list of Location objects.
     * @param {String} [whereClause] Optional whereClause should be a valid SQLite statement - such as "name = 'New York'" or "name = ?".
     * @param {[any]} [values] Array of values to be used for the whereClause if it contains any sqlite parameters - such as 'id=?'. For example, if the whereClause is "name=? and israel=?", then values should be: ['Natanya', true].
     */
    static async _queryLocations(whereClause, values) {
        const list = [];
        await DataUtils._executeSql(`SELECT * FROM locations ${whereClause ? ' WHERE ' + whereClause : ''} ORDER BY name`, values)
            .then(results => {
                log('442 - Results returned from db  - in _queryLocations');
                for (let l of results.list) {
                    list.push(new Location(
                        l.name,
                        !!l.israel,
                        l.latitude,
                        l.longitude,
                        l.utcoffset,
                        l.elevation,
                        l.candles,
                        l.locationId));
                }
            });
        return list;
    }
    /**
     * Executes sql on the database. promise resolves with an object { list: ResultsArray, id: LastInsertedRowId }
     * @param {String} sql The sql to execute. Can contain parameters - in the form of ? characters.
     * @param {[any]} values Array of the values to be used for any sqlite parameters in the sql
     */
    static async _executeSql(sql, values) {
        const resultsList = [];
        let insertId;
        let db;

        await SQLite.openDatabase({ name: 'luachAndroidDB', createFromLocation: '~data/luachAndroidDB.sqlite' })
            .then(async database => {
                db = database;
                log('0120 - database is open. Starting transaction...');
                await db.executeSql(sql, values).then(results => {
                    if (!!results && results.length > 0 && !!results[0].rows && !!results[0].rows.item) {
                        log(`0121 - the sql was executed successfully - ${results[0].rows.length.toString()} rows returned`);
                        for (let i = 0; i < results[0].rows.length; i++) {
                            resultsList.push(results[0].rows.item(i));
                        }
                    }
                    else if (!!results && isNumber(results.rowsAffected)) {
                        log(`0122 - sql executed successfully - ${results.rowsAffected.toString()} rows affected`);
                    }
                    else {
                        log('0123 - sql executed successfully - Results information is not available');
                    }
                    if (!!results && results.length) {
                        insertId = results[0].insertId;
                    }
                });
            }).catch(err => {
                warn('0124 - error opening database');
                error(err);
                DataUtils._closeDatabase(db);
            });

        return { list: resultsList, id: insertId };
    }
    static _closeDatabase(db) {
        if (db) {
            db.close().then(status => {
                log('130 -  Database is now CLOSED');
            }).catch(err => {
                warn('131 - error closing database');
                error(err);
            });
        }
        else {
            warn('132 - db variable is not a database object');
        }
    }
}
