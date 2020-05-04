import { AsyncStorage } from 'react-native';
import { setDefault } from '../GeneralUtils';
/**
 * @type {{requirePin:boolean, PIN:String, remoteUserName:String, remotePassword:String  }}
 */
export default class LocalStorage {
    constructor() {
        this._requirePin = false;
        this._PIN = null;
        this._remoteUserName = null;
        this._remotePassword = null;
    }
    /**
     * @returns {LocalStorage}
     */
    static async getLocalStorage() {
        const allKeys = await AsyncStorage.getAllKeys(),
            localStorage = new LocalStorage();

        localStorage._requirePin = setDefault(
            await Boolean(
                LocalStorage.getLocalStorageValue('REQUIRE_PIN', allKeys)
            ),
            false
        );
        localStorage._PIN = await LocalStorage.getLocalStorageValue(
            'PIN',
            allKeys
        );
        localStorage._remoteUserName = await LocalStorage.getLocalStorageValue(
            'REMOTE_USERNAME',
            allKeys
        );
        localStorage._remotePassword = await LocalStorage.getLocalStorageValue(
            'REMOTE_PASSWORD',
            allKeys
        );
        return localStorage;
    }

    get requirePin() {
        return this._requirePin;
    }
    set requirePin(val) {
        LocalStorage.setLocalStorageValue('REQUIRE_PIN', val);
        this._requirePin = val;
    }

    get PIN() {
        return this._PIN;
    }
    set PIN(val) {
        LocalStorage.setLocalStorageValue('PIN', val);
        this._PIN = val;
    }

    get remoteUserName() {
        return this._remoteUserName;
    }
    set remoteUserName(val) {
        LocalStorage.setLocalStorageValue('REMOTE_USERNAME', val);
        this._remoteUserName = val;
    }    

    get remotePassword() {
        return this._remotePassword;
    }
    set remotePassword(val) {
        LocalStorage.setLocalStorageValue('REMOTE_PASSWORD', val);
        this._remotePassword = val;
    }

    /**
     * Saves the current settings to AsyncStorage.
     * @param {LocalStorage} localStorage
     */
    static async saveLocalStorage(localStorage) {
        log('started save Settings');
        await AsyncStorage.multiSet(
            [
                ['REQUIRE_PIN', JSON.stringify(localStorage.requirePin)],
                ['PIN', localStorage.PIN],
                ['REMOTE_USERNAME', localStorage.remoteUserName],
                ['REMOTE_PASSWORD', localStorage.remotePassword],
            ],
            (errors) =>
                errors &&
                error('Error during AsyncStorage.multiSet for settings', errors)
        );
        log('Saved settings', this);
    }

    static async getLocalStorageValue(name, allKeys) {
        let val;
        allKeys = allKeys || (await AsyncStorage.getAllKeys());
        if (allKeys.includes(name)) {
            try {
                const sn = await AsyncStorage.getItem(name);
                if (sn) {
                    val = JSON.parse(sn);
                }
            } catch (e) {
                error('Failed to load remotePassword from storage data:', e);
            }
        }
        return val;
    }

    static async setLocalStorageValue(name, value) {
        try {
            await AsyncStorage.setItem(name, value);
        } catch (e) {
            error('Failed to load remotePassword from storage data:', e);
        }
    }
}
