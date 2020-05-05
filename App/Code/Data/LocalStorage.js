import { AsyncStorage } from 'react-native';
import { log, error } from '../GeneralUtils';
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
     * Loads the current objects properties from the actual device using AsyncStorage
     */
    async load() {
        const allKeys = ['REQUIRE_PIN', 'PIN', 'REMOTE_USERNAME', 'REMOTE_PASSWORD'],
            values = await AsyncStorage.multiGet(allKeys);
        for (let kvp of values) {
            switch (kvp[0]) {
                case 'REQUIRE_PIN':
                    this._requirePin = Boolean(JSON.parse(kvp[1]));
                    break;
                case 'PIN':
                    this._PIN = JSON.parse(kvp[1]);
                    break;
                case 'REMOTE_USERNAME':
                    this._remoteUserName = JSON.parse(kvp[1]);
                    break;
                case 'REMOTE_PASSWORD':
                    this._remotePassword = JSON.parse(kvp[1]);
                    break;
            }
        }
    }

    /**
     * Saves this object to AsyncStorage.
     */
    async saveLocalStorage() {
        log('started save Settings');
        await AsyncStorage.multiSet(
            [
                ['REQUIRE_PIN', JSON.stringify(this._requirePin)],
                ['PIN', this._PIN],
                ['REMOTE_USERNAME', this._remoteUserName],
                ['REMOTE_PASSWORD', this._remotePassword],
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
