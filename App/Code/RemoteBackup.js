import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import LocalStorage from './Data/LocalStorage';
import { GLOBALS, log, warn, error, getFileName } from './GeneralUtils';
import AppData from './Data/AppData';
import DataUtils from './Data/DataUtils';

const serverURL = __DEV__ ? 'http://10.0.2.2:81/api/luach' : 'https://www.compute.co.il/api/luach';

export default class RemoteBackup {
    constructor() {
        this.localStorage = null;
    }
    getNewDatabaseName() {
        const d = new Date();
        return `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}_${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}.sqlite`;
    }
    async getLastBackupDate() {
        const response = await this.request('date');
        if (response && response.Succeeded && response.Date) {
            return new Date(response.Date);
        } else {
            warn(response.ErrorMessage);
        }
    }
    async getReqHeaders() {
        return {
            Authorization: `bearer ${await this.getAccountName()}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
    }
    async getLocalStorage() {
        if (!this.localStorage) {
            this.localStorage = await LocalStorage.loadAll();
        }
        return this.localStorage;
    }
    async getAccountName() {
        const localStorage = await this.getLocalStorage();
        return Buffer.from(
            `${localStorage.remoteUserName}:~:${localStorage.remotePassword}`
        ).toString('base64');
    }
    async request(url, method, data) {
        try {
            url = serverURL + (url ? '/' + url : '');
            const headers = await this.getReqHeaders(),
                options = {
                    method: method || 'GET',
                    data: data,
                    headers: new Headers(headers),
                },
                response = await fetch(url, options);
            log(`Http Request: ${method || 'GET'}  ${url}`);
            const responseData = await response.json(),
                succeeded = responseData && responseData.Succeeded;
            if (succeeded) {
                log(`Response Succeeded: ${JSON.stringify(responseData)}`);
            } else {
                warn(`Response did NOT Succeed: ${JSON.stringify(responseData)}`);
            }
            return responseData;
        } catch (err) {
            error(`Http request error: ${JSON.stringify(err)}`);
        }
    }
    async createAccount() {
        const response = await this.request('account');
        if (response.Succeeded) {
            return 'Account has been successfully created';
        } else {
            warn(response);
            return `Luach could not create the account.\\n${response.ErrorMessage}`;
        }
    }
    async uploadBackup() {
        const url = serverURL + '/backup',
            localStorage = await this.getLocalStorage();
        let base64;
        if (localStorage.databasePath === GLOBALS.DEFAULT_DB_PATH && GLOBALS.IS_ANDROID) {
            base64 = await RNFS.readFileAssets(GLOBALS.DEFAULT_DB_PATH.replace('~', ''), 'base64');
        } else {
            base64 = await RNFS.readFile(localStorage.databasePath, 'base64');
        }
        const buffer = Buffer.from(base64, 'base64');
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    Authorization: `bearer ${await this.getAccountName()}`,
                    Accept: 'application/json',
                },
                body: buffer,
            });
            log(`Http Request: PUT ${url}`);
            const responseData = await response.json(),
                succeeded = responseData && responseData.Succeeded;
            if (succeeded) {
                log(`Response Succeeded: ${JSON.stringify(responseData)}`);
                return 'Your data has been successfully backed up to the Luach server.';
            } else {
                warn(`Response did NOT Succeed: ${JSON.stringify(responseData)}`);
                return `Luach was not able to back up your data to the Luach server.\\n${responseData.ErrorMessage}`;
            }
        } catch (err) {
            error(`Http request error: ${JSON.stringify(err)}`);
            return `Luach was not able to back up your data to the Luach server.\\n${err.message}`;
        }
    }
    /**
     * Restore a previously uploaded remote backup.
     * @returns {{success:Boolean, appData:AppData, message:string}}
     */
    async restoreBackup() {
        let success, appData, message;
        //The restore is done by Base64 "bridging" -
        //the server encodes the sqlite file in base64 and returns it as a string.
        //We retrieve that here and decode it back to binary.
        const localStorage = await this.getLocalStorage(),
            response = await this.request();
        if (response.Succeeded) {
            try {
                log('Successfully acquired backup file from server');
                const prevPath = localStorage.databasePath,
                    //The database file is put in a folder where both android and IOS have access
                    newPath = RNFS.DocumentDirectoryPath + '/' + this.getNewDatabaseName();
                log('The exiting database is at ' + prevPath);
                log('The new database will be ' + newPath);
                //Write the file data to disc.
                //The RNFS.writeFile function does the decoding from base 64 to binary.
                await RNFS.writeFile(newPath, response.FileData, 'base64');
                log('Successfully wrote backup file to ' + newPath);
                //Save the new database path to the local storage
                await LocalStorage.setLocalStorageValue('DATABASE_PATH', newPath);
                //Set the data base utilities to access the new database path
                DataUtils._databasePath = newPath;
                log('Set the DataUtils database path to ' + newPath);
                log('The new database is named ' + getFileName(newPath));
                //Reset the global application data object
                global.GlobalAppData = null;
                log('Set Global.AppData to null');
                //Reload the global app data from the newly overwritten database file
                appData = await AppData.getAppData();
                log('Reloaded Global.AppData from new database');
                //Delete the old database file
                RNFS.unlink(prevPath);
                log('Deleted previous file ' + prevPath);
                success = true;
            } catch (e) {
                error(e.message);
                message = `Luach was unable to restore from the online backup.\\n${e.message}`;
            }
        } else {
            warn(JSON.stringify(response));
            message = `Luach was unable to restore from the online backup.\\n${response.ErrorMessage}`;
        }
        return { success, appData, message };
    }
}
