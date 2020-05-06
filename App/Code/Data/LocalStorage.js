import AsyncStorage from "@react-native-community/async-storage";
import { log, error } from "../GeneralUtils";

const AllKeys = ["REQUIRE_PIN", "PIN", "REMOTE_USERNAME", "REMOTE_PASSWORD"];

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
        log("Setting requirePin in storage data");
        LocalStorage.setLocalStorageValue("REQUIRE_PIN", val);
        this._requirePin = val;
    }

    get PIN() {
        return this._PIN;
    }
    set PIN(val) {
        log("Setting PIN in storage data");
        LocalStorage.setLocalStorageValue("PIN", val);
        this._PIN = val;
    }

    get remoteUserName() {
        return this._remoteUserName;
    }
    set remoteUserName(val) {
        log("Setting remoteUserName in storage data");
        LocalStorage.setLocalStorageValue("REMOTE_USERNAME", val);
        this._remoteUserName = val;
    }

    get remotePassword() {
        return this._remotePassword;
    }
    set remotePassword(val) {
        log("Setting remotePassword in storage data");
        LocalStorage.setLocalStorageValue("REMOTE_PASSWORD", val);
        this._remotePassword = val;
    }

    async saveAll() {
        const values = [];
        values.push(["REQUIRE_PIN", JSON.stringify(!!this._requirePin)]);
        values.push(["PIN", JSON.stringify(this._PIN)]);
        values.push(["REMOTE_USERNAME", JSON.stringify(this._remoteUserName)]);
        values.push(["REMOTE_PASSWORD", JSON.stringify(this._remotePassword)]);
        try {
            await AsyncStorage.multiSet(values);
        } catch (e) {
            error(e);
        }
    }

    /**
     * Loads the current objects properties from the actual device using AsyncStorage
     */
    static async loadAll() {
        return new Promise((resolve, reject) => {
            try {
                AsyncStorage.multiGet(AllKeys, (err, stores) => {
                    if (err) {
                        error(
                            "Error during AsyncStorage.multiGet for settings",
                            err
                        );
                        reject(err);
                    } else {
                        const ls = new LocalStorage();
                        stores.map((result, i, store) => {
                            const key = store[i][0],
                                value = store[i][1];
                            switch (key) {
                                case "REQUIRE_PIN":
                                    ls._requirePin = Boolean(value);
                                    break;
                                case "PIN":
                                    ls._PIN = JSON.parse(value);
                                    break;
                                case "REMOTE_USERNAME":
                                    ls._remoteUserName = JSON.parse(value);
                                    break;
                                case "REMOTE_PASSWORD":
                                    ls._remotePassword = JSON.parse(value);
                                    break;
                            }
                        });
                        resolve(ls);
                    }
                });
            } catch (er) {
                reject(er);
            }
        });
    }

    async clear() {
        await AsyncStorage.multiRemove(AllKeys);
    }

    static async setLocalStorageValue(name, value) {
        try {
            await AsyncStorage.setItem(name, JSON.stringify(value));
            log("Set " + name + " to " + value + " in storage data");
        } catch (e) {
            error(
                "Failed to set " + name + " to " + value + " in storage data:",
                e
            );
        }
    }

    static async wasInitialized() {
        return new Promise((resolve, reject) => {
            try {
                AsyncStorage.getAllKeys((err, keys) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(keys && keys.length && keys.includes(AllKeys[0]));
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    static async initialize(requirePin, PIN, remoteUserName, remotePassword) {
        if (!(await this.wasInitialized())) {
            const ls = new LocalStorage();
            ls.requirePin = !!requirePin;
            ls.PIN = PIN;
            ls.remoteUserName = remoteUserName;
            ls.remotePassword = remotePassword;
            await ls.saveAll();
        }
    }
}
