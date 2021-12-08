import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import LocalStorage from './Data/LocalStorage';
import { log, warn, error, getFileName, getRandomString } from './GeneralUtils';
import AppData from './Data/AppData';
import DataUtils from './Data/DataUtils';

/*
To enable the domain compute.dev on a localhost windows machine:
 1: On the host machine, open C:\Windows\System32\drivers\etc\hosts as an admin and add the line:
        127.0.0.1  compute.dev
 2: You probably need an ssl for that, so run in an admin powershell:
        New-SelfSignedCertificate  -DnsName compute.dev -CertStoreLocation cert:\LocalMachine\My  -FriendlyName "Compute.dev" -NotAfter (get-date).AddYears(5)
 3: In IIS (inetmgr) for the site containing the compute luach api,
    set the host name to compute.dev (for both http and https),
    and set the https binding to use the "Compute.dev" certificate you created in the previous step.
 4: If running compute.dev in the browser gives you an ssl error, open mmc,
    add the "Certificates" snap-in for the computer account
    and copy the compute.dev certificate from
    the Personal store to Trusted Root Certification Authority.
After the above, to enable running the site from a Mac in the same network:
    1. Open a terminal, and run sudo nano /etc/hosts
    2. Add the following line:
        10.0.0.#     compute.dev
        Of course, replace the ip adress with the LAN address of the Windows machine above.
    3. Type cntrl+o ENTER (save in nano) cntrl+x (exit in nano)
    4. To clear the DNS cache, in the terminal, run sudo killall -HUP mDNSResponder
    5. Now on the windows machine, run MMC and add the certificates snap-in. Then choose th local machine.
    6. Open the Trusted Root Certification Authority store, right-click on the compute.dev certficate > tasks > export.
    7. Choose to export with private key and when asked, create a password.
    8. Copy the whatever.pfx file to the mac and double click on it to add it to the keychain using the password created in the above step.
    9. Go to the added cert in the keychain, open it, and set it as fully trusted (or at least with ssl authorization).
    10. Check https://compute.dev in the browser.

To enable the domain compute.dev for use from an android device:
    NOTE: For an android emulator, you need to be running Android Pie in a "Google API" image - NOT Google Play image
    Also, you need to run the emulator using: ...Android\sdk\emulator\emulator.exe -avd Pixel_2_API_28 -writable-system
    (The important part is the -writable-system The rest should be tweaked as needed of course)
 1: Create a host file somewhere on the host machine containing the line: 10.0.2.2  compute.dev
    Make sure to add a blank line after the last line of the file.
    Also make sure that the file uses LF line breaks. (Unix style, not CRLF which is the windows default)
 2: Run: adb root
         adb remount
         adb push HOST_FILE_PATH /etc/hosts  (replace "HOST_FILE_PATH" with the path to above hosts file)
 3: Back in the Android device or emulator, open the browser and navigate to compute.dev.
    If you get your local site then, Mazel Tov.
 */
const serverURL = __DEV__
    ? 'http://10.0.2.2:83/api/luach'
    : 'https://www.compute.co.il/api/luach';

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
        if (response && response.Succeeded) {
            return response.HasBackup ? new Date(response.Date) : true;
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
    /**
     * @returns {LocalStorage} a filled local storage object
     */
    async getLocalStorage() {
        if (!this.localStorage) {
            this.localStorage = await LocalStorage.loadAll();
        }
        return this.localStorage;
    }
    async getAccountName() {
        const localStorage = await this.getLocalStorage();
        return Buffer.from(
            `${localStorage.remoteUserName}:~~~~~~~~~~~~~:${localStorage.remotePassword}`
        ).toString('base64');
    }
    async request(url, method, data) {
        let responseData;
        try {
            url = serverURL + (url ? '/' + url : '');
            const headers = await this.getReqHeaders(),
                options = {
                    method: method || 'GET',
                    data: data,
                    headers: new Headers(headers),
                },
                response = await fetch(url, options);
            log(`Http Request: ${method || 'GET'}  ${url}`, response);

            responseData = await response.json();
            if (responseData && responseData.Succeeded) {
                log(
                    `${
                        options.method
                    } ${url} - Response Succeeded: ${JSON.stringify(
                        responseData
                    )}`, responseData
                );
            } else {
                warn(
                    `Response did NOT Succeed: ${JSON.stringify(responseData)}`, responseData
                );
            }
        } catch (err) {
            error(
                `${
                    method || 'GET'
                } ${url} - Http request error: ${JSON.stringify(err)}`,
                err, responseData
            );
        }
        return responseData;
    }
    async createAccount() {
        const response = await this.request('account');
        let success = false,
            message = null;
        if (response.Succeeded) {
            success = true;
            message = 'Account has been successfully created';
        } else {
            warn(response);
            message = `Luach could not create the account.\n${response.ErrorMessage}`;
        }
        return { success, message };
    }
    async accountExists() {
        const response = await this.request('exists');
        return response.Succeeded && response.Exists;
    }
    async uploadBackup() {
        const url = `${serverURL}/backup`,
            dbAbsolutePath = await DataUtils.getDatabaseAbsolutePath();
        let success = false,
            message = null;
        if (RNFS.exists(dbAbsolutePath)) {
            log(`Current database located successfully at ${dbAbsolutePath}`);
            const base64 = await RNFS.readFile(dbAbsolutePath, 'base64'),
                buffer = Buffer.from(base64, 'base64');
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
                const responseData = await response.json();
                success = responseData && responseData.Succeeded;
                if (success) {
                    log(
                        `PUT ${url} - Response.Succeeded = true: ${JSON.stringify(
                            responseData
                        )}`
                    );
                    message =
                        'Your data has been successfully backed up to the Luach server.';
                } else {
                    warn(
                        `PUT ${url} - Response.Succeeded = false: ${JSON.stringify(
                            responseData
                        )}`
                    );
                    message = `Luach was not able to back up your data to the Luach server.\n${responseData.ErrorMessage}`;
                }
            } catch (err) {
                error(
                    `PUT ${url} - Http request error: ${JSON.stringify(err)}`
                );
                message = `Luach was not able to back up your data to the Luach server.\n${err.message}`;
            }
        } else {
            warn(`Current database not found at ${dbAbsolutePath}`);
            message = `Luach was not able to back up your data to the Luach server.\n
                        Your local data could not be accessed for upload`;
        }
        return { success, message };
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
                log(
                    `GET ${serverURL} - Successfully acquired backup file from server`
                );
                const prevPath = localStorage.databasePath,
                    //The database file is put in a folder where both android and IOS have access
                    newPath = `${
                        RNFS.DocumentDirectoryPath
                    }/${this.getNewDatabaseName()}`,
                    newDbName = getFileName(newPath);
                log(`The existing database is named ${getFileName(prevPath)}
                        and was found at ${prevPath}`);
                log(
                    `The NEW database will be named${newDbName}
                        and its pre-populated file will be placed at ${newPath}`
                );
                //Write the file data to disc.
                //The RNFS.writeFile function does the decoding from base 64 to binary.
                await RNFS.writeFile(newPath, response.FileData, 'base64');
                log(`Successfully copied backup file to ${newPath}`);
                //Save the new database path to the local storage
                await LocalStorage.setLocalStorageValue(
                    'DATABASE_PATH',
                    newPath
                );
                //Set the data base utilities to access the new database path
                DataUtils._databasePath = newPath;
                log(`Set the DataUtils database path to ${newPath}`);
                //Reset the global application data object
                appData = await AppData.fromDatabase();
                global.GlobalAppData = appData;
                //Reload the global app data from the newly overwritten database file
                log('Reloaded Global.AppData from new database');
                //Delete the old database file
                RNFS.unlink(prevPath);
                log(`Deleted previous file ${prevPath}`);
                success = true;
            } catch (e) {
                error(e.message);
                message = `Luach was unable to restore from the online backup.\n${e.message}`;
            }
        } else {
            warn(JSON.stringify(response));
            message = `Luach was unable to restore from the online backup.\n${response.ErrorMessage}`;
        }
        return { success, appData, message };
    }
    static async DoBackupNoMatterWhat(localStorage) {
        const remoteBackup = new RemoteBackup();
        if (!localStorage) localStorage = remoteBackup.getLocalStorage();
        else remoteBackup.localStorage = localStorage;
        if (!localStorage.remoteUserName || !localStorage.remotePassword) {
            return {
                success: false,
                message:
                    '"remote user name" and "remote password" must be entered on the Settings page before doing a backup.',
            };
        }
        const hasAccount = await remoteBackup.accountExists();
        if (!hasAccount) {
            const response = await remoteBackup.createAccount();
            if (!response.success) {
                return response;
            }
        }
        return await remoteBackup.uploadBackup();
    }
    static async createFreshUserNewAccount() {
        const remoteBackup = new RemoteBackup(),
            localStorage = await remoteBackup.getLocalStorage();
        if (localStorage.remoteUserName || localStorage.remotePassword) {
            log(
                'This user has already set their username or password. No account will be created.'
            );
            return false;
        }
        while (await remoteBackup.accountExists()) {
            localStorage.remoteUserName = getRandomString(8);
            localStorage.remotePassword = getRandomString(8);
        }
        const response = await remoteBackup.createAccount();
        if (!response.success) {
            log(
                `Luach was unable to restore from the online backup.\n${response.message}`
            );
            warn(JSON.stringify(response));
        }
        return response.success;
    }
}
