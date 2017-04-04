import SQLite from 'react-native-sqlite-storage';
import { isNumber } from '../GeneralUtils';
import jDate from '../JCal/jDate';
import Settings from '../Settings';
import Location from '../JCal/Location';
import Entry from '../Chashavshavon/Entry';
import EntryList from '../Chashavshavon/EntryList';
import Onah from '../Chashavshavon/Onah';
import NightDay from '../Chashavshavon/NightDay';
import Kavuah from '../Chashavshavon/Kavuah';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

export default class DataUtils {

    static async SettingsFromDatabase(locations) {
        let settings;
        await DataUtils._executeSql('SELECT * from settings')
            .then(async results => {
                const dbSet = results.list[0],
                    location = locations ?
                        locations.find(l => l.locationId === dbSet.locationId) :
                        await DataUtils.LocationFromDatabase(dbSet.locationId);
                settings = new Settings(
                    location,
                    dbSet.showOhrZeruah,
                    dbSet.onahBeinunis24Hours,
                    dbSet.numberMonthsAheadToWarn,
                    dbSet.keepLongerHaflagah,
                    dbSet.cheshbonKavuahByActualEntry,
                    dbSet.cheshbonKavuahByCheshbon);
            })
            .catch(error => {
                console.warn('Error trying to get settings from the database.');
                console.error(error);
            });
        return settings;
    }
    static async SettingsToDatabase(settings) {
        await DataUtils._executeSql(`UPDATE settings SET
            locationId=?,
            showOhrZeruah=?,
            onahBeinunis24Hours=?,
            numberMonthsAheadToWarn=?,
            keepLongerHaflagah=?,
            cheshbonKavuahByActualEntry=?,
            cheshbonKavuahByCheshbon=?`,
            [
                (settings.location && settings.location.locationId) || 28, //Jerusalem is 28
                settings.showOhrZeruah,
                settings.onahBeinunis24Hours,
                settings.numberMonthsAheadToWarn,
                settings.keepLongerHaflagah,
                settings.cheshbonKavuahByActualEntry,
                settings.cheshbonKavuahByCheshbon
            ])
            .catch(error => {
                console.warn('Error trying to enter settings into the database.');
                console.error(error);
            });
    }
    static async EntryListFromDatabase(settings) {
        const entryList = new EntryList(settings);
        await DataUtils._executeSql('SELECT * from entries ORDER BY dateAbs, day')
            .then(results => {
                if (results.list.length > 0) {
                    for (let e of results.list) {
                        const onah = new Onah(new jDate(e.dateAbs), e.day ? NightDay.Day : NightDay.Night);
                        entryList.add(new Entry(onah, e.entryId));
                    }
                    entryList.calulateHaflagas();
                }
            })
            .catch(error => {
                console.warn('Error trying to get all entries from the database.');
                console.error(error);
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
    /**Returns a list of Location objects with all the locations in the database.*/
    static async GetAllLocations() {
        return await DataUtils._queryLocations();
    }
    /**Returns a list of the Location objects in the database that their name or heb values contain the search term.
    The search is not case sensitive.*/
    static async SearchLocations(search) {
        if (!search) {
            throw 'Search parameter cannot be empty. Use GetAllLocations to retrieve all locations.';
        }
        return await DataUtils._queryLocations('name || IFNULL(heb, \'\') LIKE ?', [`%${search}%`]);
    }
    /**Gets all Kavuahs from the database.
     *
     * `entries`: An EntryList instance or an Array of entries where the settingEntry can be found.*/
    static async GetAllKavuahs(entries) {
        if (entries instanceof EntryList) {
            entries = entries.list;
        }
        let list = [];
        await DataUtils._executeSql('SELECT * from kavuahs')
            .then(results => {
                list = results.list.map(k => new Kavuah(k.kavuahType,
                    k.settingEntry = entries.find(e => e.entryId === k.settingEntryId),
                    k.specialNumber,
                    k.cancelsOnahBeinunis,
                    k.active,
                    k.ignore,
                    k.kavuahId));
            })
            .catch(error => {
                console.warn('Error trying to get all kavuahs from the database.');
                console.error(error);
            });
        return list;
    }
    static async KavuahToDatabase(kavuah) {
        if (!kavuah.settingEntry.hasId) {
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
                    console.log(`Updated Kavuah Id ${kavuah.kavuahId.toString()}`);
                })
                .catch(error => {
                    console.warn(`Error trying to update Kavuah Id ${kavuah.kavuahId.toString()} to the database.`);
                    console.error(error);
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
                [params])
                .then(results => kavuah.kavuahId = results.id)
                .catch(error => {
                    console.warn('Error trying to insert kavuah into the database.');
                    console.error(error);
                });
        }
    }
    static async EntryToDatabase(entry) {
        if (entry.hasId) {
            await DataUtils._executeSql('UPDATE entries SET dateAbs=?, day=? WHERE entryId=?',
                [entry.date.Abs, entry.nightDay === NightDay.Day, entry.entryId])
                .then(() => {
                    console.log(`Updated Entry Id ${entry.entryId.toString()}`);
                })
                .catch(error => {
                    console.warn(`Error trying to update entry id ${entry.entryId.toString()} to the database.`);
                    console.error(error);
                });
        }
        else {
            await DataUtils._executeSql('INSERT INTO entries (dateAbs, day) VALUES (?, ?)',
                [entry.date.Abs, entry.nightDay === NightDay.Day])
                .then(results => entry.entryId = results.id)
                .catch(error => {
                    console.warn('Error trying to insert entry into the database.');
                    console.error(error);
                });
        }
    }
    /**
        Queries the locations table of the local sqlite database, and returns a list of Location objects.
        Optional whereClause should be a valid SQLite statement - such as "name = 'New York'" or "name = ?".
        If the whereClause contains any parameters (? characters), the values argument should be provided with an array of values.
        For example, if the whereClause is "name=? and israel=?", then values should be: ['Natanya', true].*/
    static async _queryLocations(whereClause, values) {
        const list = [];
        await DataUtils._executeSql(`SELECT * FROM locations ${whereClause ? ' WHERE ' + whereClause : ''} ORDER BY name`, values)
            .then(results => {
                console.log('442 - Results returned from db  - in _queryLocations');
                for (let l of results.list) {
                    list.push(new Location(
                        l.name,
                        l.israel,
                        l.latitude,
                        l.longitude,
                        l.utcOffset,
                        l.elevation,
                        l.candles,
                        l.locationId));
                }
            });
        return list;
    }
    /**
     * Executes sql on the database. promise resolves with an object { list: ResultsArray, id: LastInsertedRowId }
     * @param {*} sql 
     * @param {*} values 
     */
    static async _executeSql(sql, values) {
        const resultsList = [];
        let insertId;
        let db;

        await SQLite.openDatabase({ name: 'luachAndroidDB', createFromLocation: '~data/luachAndroidDB.sqlite' })
            .then(async database => {
                db = database;
                console.log('0120 - database is open. Starting transaction...');
                await db.executeSql(sql, values).then(results => {
                    if (!!results && results.length && !!results[0].rows && !!results[0].rows.item) {
                        console.log(`0121 - the sql was executed successfully - ${results[0].rows.length.toString()} rows returned`);
                        for (let i = 0; i < results[0].rows.length; i++) {
                            resultsList.push(results[0].rows.item(i));
                        }
                    }
                    else if (!!results && isNumber(results.rowsAffected)) {
                        console.log(`0122 - sql executed successfully - ${results.rowsAffected.toString()} rows affected`);
                    }
                    else {
                        console.log('0123 - sql executed successfully - Results information is not available');
                    }
                    if (!!results && results.length) {
                        insertId = results[0].insertId;
                    }
                });
                /*await db.transaction(async tx => {
                    console.log(`121 - Transaction is running. Starting to execute "${sql}"`);
                    await tx.executeSql(sql, values).then(([tx, results]) => {
                        if (!!results && !!results.rows && results.rows.length > 0) {
                            console.log(`122 - the sql was executed successfully - ${results.rows.length.toString()} rows returned`);
                            for (let i = 0; i < results.rows.length; i++) {
                                resultsList.push(results.rows.item(i));
                            }
                        }
                        else if (!!results && isNumber(results.rowsAffected)) {
                            console.log(`122a - sql executed successfully - ${results.rowsAffected.toString()} rows affected`);
                        }
                        else {
                            console.log(`122b - sql executed successfully - Results information is not available`);
                        }
                    }).catch(error => {
                        console.warn('123 - error executing ' + sql);
                        console.error(error);
                    });
                }).then(() => {
                    console.log(`124 - Transaction commited successfully.`);
                    DataUtils._closeDatabase(db);
                });*/
            }).catch(error => {
                console.warn('0124 - error opening database');
                console.error(error);
                DataUtils._closeDatabase(db);
            });

        return { list: resultsList, id: insertId };
    }
    static _closeDatabase(db) {
        if (db) {
            db.close().then(status => {
                console.log('130 -  Database is now CLOSED');
            }).catch((error) => {
                console.warn('131 - error closing database');
            });
        }
        else {
            console.warn('132 - db variable is not a database object');
        }
    }
}
