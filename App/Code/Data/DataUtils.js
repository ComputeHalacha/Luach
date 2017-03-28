import SQLite from 'react-native-sqlite-storage';
import { isNumber } from '../GeneralUtils';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

export default class DataUtils {
    static async executeSql(sql, values) {
        const resultsList = [];
        let db;

        await SQLite.openDatabase({ name: "luachAndroidDB", createFromLocation: '~data/luachAndroidDB.sqlite' })
            .then(async database => {
                db = database;
                console.log('120 - database is open. Starting transaction...');
                await db.transaction(async tx => {
                    console.log(`121 - Transaction is running. Starting to execute "${sql}"`);
                    await tx.executeSql(sql, values).then(([tx, results]) => {
                        if (!!results && !!results.rows && results.rows.length > 0) {
                            console.log(`122 - sql executed successfully - ${results.rows.length.toString()} rows returned`);
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
                });
            }).catch(error => {
                console.warn("127 - error opening database");
                console.error(error);
                DataUtils._closeDatabase(db);
            });

        return resultsList;
    }
    static _closeDatabase(db) {
        if (!!db) {
            db.close().then((status) => {
                console.log("130 -  Database is now CLOSED");
            }).catch((error) => {
                console.warn("131 - error closing database");
                console.error(error);
            });
        }
        else {
            console.warn("132 - db variable is not a database object");
        }
    }
}
