import React from 'react';
import { ScrollView, View, Text, Button, TextInput } from 'react-native';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import LocalStorage from '../../Code/Data/LocalStorage';
import SideMenu from '../Components/SideMenu';
import { GLOBALS, popUpMessage, log, warn, error, getFileName } from '../../Code/GeneralUtils';
import Utils from '../../Code/JCal/Utils';
import { GeneralStyles } from '../styles';
import AppData from '../../Code/Data/AppData';
import DataUtils from '../../Code/Data/DataUtils';

const serverURL = __DEV__ ? 'http://10.0.2.2:81/api/luach' : 'https://www.compute.co.il/api/luach';

export default class RemoteBackupScreen extends React.Component {
    static navigationOptions = {
        title: 'Backup your data',
    };
    constructor(props) {
        super(props);
        this.navigate = this.props.navigation.navigate;
        const { appData, onUpdate } = this.props.navigation.state.params;
        this.appData = appData;
        this.dbFileName = null;
        this.update = (ad) => {
            ad = ad || this.appData;
            if (onUpdate) {
                onUpdate(ad);
            }
        };

        this.sdate = new Date();
        this.sdateString =
            Utils.sMonthsEng[this.sdate.getMonth()] + ' ' + this.sdate.getFullYear().toString();
        this.state = {
            enteredRemoteUserName: null,
            enteredRemotePassword: null,
            localStorage: new LocalStorage(),
        };
        this.createAccount = this.createAccount.bind(this);
        this.setLastBackupDate = this.setLastBackupDate.bind(this);
        this.uploadBackup = this.uploadBackup.bind(this);
        this.restoreBackup = this.restoreBackup.bind(this);
    }
    async componentDidMount() {
        const localStorage = await LocalStorage.loadAll();
        this.setState({ localStorage });
        this.dbFileName = getFileName(localStorage.databasePath);
        if (this.state.localStorage.remoteUserName && this.state.localStorage.remotePassword) {
            await this.setLastBackupDate();
        }
    }
    async setLastBackupDate() {
        let lastBackupDate;
        const response = await this.request('date');
        if (response && response.Succeeded && response.Date) {
            const buDate = new Date(response.Date);
            lastBackupDate = buDate.toLocaleString();
        } else {
            popUpMessage(response.ErrorMessage);
        }

        this.setState({ lastBackupDate });
    }
    getReqHeaders() {
        return {
            Authorization: `bearer ${this.getAccountName()}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
    }
    getAccountName() {
        return Buffer.from(
            `${this.state.localStorage.remoteUserName}:~:${this.state.localStorage.remotePassword}`
        ).toString('base64');
    }
    async request(url, method, data) {
        try {
            url = serverURL + (url ? '/' + url : '');
            const response = await fetch(url, {
                method: method || 'GET',
                data: data,
                headers: new Headers(this.getReqHeaders()),
            });
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
            popUpMessage('OK');
        } else {
            log(response);
            popUpMessage(response);
        }
    }
    async uploadBackup() {
        const url = serverURL + '/backup';
        let base64;
        if (/^~data\//.test(this.state.localStorage.databasePath)) {
            base64 = await RNFS.readFileAssets('data/' + this.dbFileName, 'base64');
        } else {
            base64 = await RNFS.readFile(this.state.localStorage.databasePath, 'base64');
        }
        const buffer = Buffer.from(base64, 'base64');
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    Authorization: `bearer ${this.getAccountName()}`,
                    Accept: 'application/json',
                },
                body: buffer,
            });
            log(`Http Request: PUT ${url}`);
            const responseData = await response.json(),
                succeeded = responseData && responseData.Succeeded;
            if (succeeded) {
                log(`Response Succeeded: ${JSON.stringify(responseData)}`);
                this.setLastBackupDate();
            } else {
                warn(`Response did NOT Succeed: ${JSON.stringify(responseData)}`);
            }
        } catch (err) {
            error(`Http request error: ${JSON.stringify(err)}`);
        }
    }
    async restoreBackup() {
        //The restore is done by Base64 "bridging" -  
        //the server encodes the sqlite file in base64 and returns it as a string.
        //We retrieve that here and decode it back to binary. 
        const response = await this.request('');
        if (response.Succeeded) {
            try {
                log('Successfully acquired backup file from server');
                const prevPath = this.state.localStorage.databasePath;
                log('The exiting database is at ' + prevPath);
                //The database file is put in a folder where both android and IOS have access
                const databasePath = RNFS.DocumentDirectoryPath + '/' + this.getNewDatabaseName();
                log('The new database will be ' + databasePath);
                //Write the file data to disc. 
                //The RNFS.writeFile function does the decoding from base 64 to binary.
                await RNFS.writeFile(databasePath, response.FileData, 'base64');
                log('Successfully wrote backup file to ' + databasePath);
                //Save the new database path to the local storage
                await LocalStorage.setLocalStorageValue('DATABASE_PATH', databasePath);
                //Set the data base utilities to access the new database path
                DataUtils._databasePath = databasePath;
                log('Set the DataUtils database path to ' + databasePath);
                log('The new database is named ' + getFileName(databasePath));
                //Reset the global application data object
                global.GlobalAppData = null;
                log('Set Global.AppData to null');
                //Reload the global app data from the newly overwritten database file
                const appData = await AppData.getAppData();
                log('Reloaded Global.AppData from new database');
                //Update all components up the tree
                this.update(appData);
                //Delete the old one
                RNFS.unlink(prevPath);
                log('Deleted previous file ' + prevPath);
                popUpMessage('Data has been successfully restored from the online backup.');
            } catch (e) {
                error(e.message);
                popUpMessage('Luach was unable to restore from the online backup.\n' + e.message);
            }
        } else {
            log(response);
            popUpMessage(response);
        }
    }

    changeLocalStorage(name, val) {
        const localStorage = this.state.localStorage;
        //save value to device storage
        localStorage[name] = val;
        this.setState({ localStorage });
    }
    getNewDatabaseName() {
        const d = new Date();
        return `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}_${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}.sqlite`;
    }
    render() {
        const remoteUserName =
                this.state.enteredRemoteUserName || this.state.localStorage.remoteUserName,
            remotePassword =
                this.state.enteredRemotePassword || this.state.localStorage.remotePassword;

        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.onUpdate}
                        appData={this.appData}
                        navigator={this.navigator}
                        helpUrl='Settings.html'
                        helpTitle='Settings'
                    />
                    <ScrollView style={{ flex: 1 }}>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Remote backup user name</Text>
                            <TextInput
                                style={GeneralStyles.textInput}
                                returnKeyType='next'
                                onSubmitEditing={(e) => {
                                    this.changeLocalStorage('remoteUserName', e.nativeEvent.text);
                                }}
                                onChangeText={(val) =>
                                    this.setState({
                                        enteredRemoteUserName: val,
                                    })
                                }
                                value={remoteUserName}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Remote backup password</Text>
                            <TextInput
                                style={GeneralStyles.textInput}
                                returnKeyType='next'
                                onSubmitEditing={(e) => {
                                    this.changeLocalStorage('remotePassword', e.nativeEvent.text);
                                }}
                                onChangeText={(val) =>
                                    this.setState({
                                        enteredRemotePassword: val,
                                    })
                                }
                                value={remotePassword}
                            />
                        </View>
                        <View style={[GeneralStyles.buttonList, GeneralStyles.headerButtons]}>
                            <Button
                                title='Create Account'
                                onPress={this.createAccount}
                                accessibilityLabel='Create remote account'
                                color={GLOBALS.BUTTON_COLOR}
                            />
                            <Button
                                title='Login to Account'
                                onPress={this.setLastBackupDate}
                                accessibilityLabel='Login to Account'
                                color={GLOBALS.BUTTON_COLOR}
                            />
                        </View>
                        <View style={GeneralStyles.headerView}>
                            {(this.state.lastBackupDate && (
                                <Text style={GeneralStyles.headerText}>
                                    Last Backup Date: {this.state.lastBackupDate}
                                </Text>
                            )) || <Text style={GeneralStyles.headerText}>No backup found</Text>}
                        </View>
                        <View
                            style={{
                                padding: 10,
                                backgroundColor: '#f1f1ff',
                                borderRadius: 6,
                                margin: 10,
                                borderWidth: 1,
                                borderColor: '#88b',
                            }}>
                            <Text>
                                When you press the "Backup My Data" button below, your data will be
                                backed up to the Luach servers.
                                {'\n\n'}
                                This data includes all your Entries, Kavuahs, Settings, Events etc.
                                {'\n\n'}
                                Important note, this action will overwrite any previous backups that
                                you have done.
                                {'\n\n'}
                                If you need multiple backups, you can create another account be
                                entering different credentials above and pressing "Create Account".
                                {'\n\n'}
                                Each account can have one data backup.
                                {'\n\n'}
                                You can retrieve and restore your backup data by entering the
                                correct credentials above, and pressing on "Restore from Backup"
                                below.
                                {'\n\n'}
                                WARNING: Restoring your data, will overwrite any existing data
                                currently stored locally in Luach.
                            </Text>
                        </View>
                        <View style={[GeneralStyles.buttonList, GeneralStyles.headerButtons]}>
                            <Button
                                title='Backup My Data'
                                onPress={this.uploadBackup}
                                accessibilityLabel='Backup My Data'
                                color={GLOBALS.BUTTON_COLOR}
                            />
                            {this.state.lastBackupDate && (
                                <Button
                                    title='Restore from Backup'
                                    onPress={this.restoreBackup}
                                    accessibilityLabel='Restore from Backup'
                                    color={GLOBALS.BUTTON_COLOR}
                                />
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}

function yon(bool) {
    return bool ? 'Yes' : 'No';
}
