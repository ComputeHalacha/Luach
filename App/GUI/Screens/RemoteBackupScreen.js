import React from 'react';
import { ScrollView, View, Text, Button, TextInput } from 'react-native';
import LocalStorage from '../../Code/Data/LocalStorage';
import SideMenu from '../Components/SideMenu';
import { GLOBALS, popUpMessage, isValidDate, confirm } from '../../Code/GeneralUtils';
import Utils from '../../Code/JCal/Utils';
import { GeneralStyles } from '../styles';
import RemoteBackup from '../../Code/RemoteBackup';

export default class RemoteBackupScreen extends React.Component {
    static navigationOptions = {
        title: 'Backup your data',
    };
    constructor(props) {
        super(props);
        this.navigate = this.props.navigation.navigate;
        const { appData, onUpdate } = this.props.navigation.state.params;
        this.appData = appData;
        this.update = (ad) => {
            ad = ad || this.appData;
            if (onUpdate) {
                onUpdate(ad);
            }
        };

        this.remoteBackup = new RemoteBackup();
        this.sdate = new Date();
        this.sdateString =
            Utils.sMonthsEng[this.sdate.getMonth()] + ' ' + this.sdate.getFullYear().toString();
        this.state = {
            enteredRemoteUserName: null,
            enteredRemotePassword: null,
            localStorage: new LocalStorage(),
        };
        this.changeLocalStorage = this.changeLocalStorage.bind(this);
        this.getLastBackupDate = this.getLastBackupDate.bind(this);
        this.restoreFromBackup = this.restoreFromBackup.bind(this);
    }

    async componentDidMount() {
        const localStorage = await LocalStorage.loadAll();
        this.setState({ localStorage });
        this.remoteBackup.localStorage = localStorage;
        if (this.state.localStorage.remoteUserName && this.state.localStorage.remotePassword) {
            if (await this.getLastBackupDate()) {
                popUpMessage('You have been successfully logged in to the remote account');
            }
        }
    }

    async getLastBackupDate() {
        const lastBackupDate = await this.remoteBackup.getLastBackupDate();
        if (isValidDate(lastBackupDate)) {
            this.setState({ lastBackupDate: lastBackupDate.toLocaleString() });
            return true;
        }
        return false;
    }

    async restoreFromBackup() {
        if (
            await confirm(
                'Confirm Restore from Backup',
                'Are you sure that you want to restore all data and settings from the remote backup?\n' +
                    'WARNING: Restoring your data, will overwrite any existing data and settings ' +
                    'currently stored locally in Luach.'
            )
        ) {
            const { success, appData, message } = await this.remoteBackup.restoreBackup();
            if (success && appData) {
                this.update(appData);
                popUpMessage('Data has been successfully restored from the online backup.');
            } else {
                popUpMessage(message);
            }
        }
    }

    changeLocalStorage(name, val) {
        const localStorage = this.state.localStorage;
        //save value to device storage
        localStorage[name] = val;
        this.setState({ localStorage });
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
                        onUpdate={this.update}
                        appData={this.appData}
                        navigator={this.props.navigation}
                        helpUrl='Settings.html'
                        helpTitle='Settings'
                    />
                    <ScrollView style={{ flex: 1 }}>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Remote backup user name</Text>
                            <TextInput
                                style={GeneralStyles.textInput}
                                multiline={false}
                                onEndEditing={(e) =>
                                    this.changeLocalStorage('remoteUserName', e.nativeEvent.text)
                                }
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
                                multiline={false}
                                onEndEditing={(e) =>
                                    this.changeLocalStorage('remotePassword', e.nativeEvent.text)
                                }
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
                                onPress={async () =>
                                    popUpMessage(await this.remoteBackup.createAccount())
                                }
                                accessibilityLabel='Create remote account'
                                color={GLOBALS.BUTTON_COLOR}
                            />
                            <Button
                                title='Login to Account'
                                onPress={async () =>
                                    popUpMessage(
                                        (await this.getLastBackupDate())
                                            ? 'You have been successfully logged in to the remote account'
                                            : 'Luach could not find your account. Please check your credentials or create a new account.'
                                    )
                                }
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
                                onPress={async () => {
                                    popUpMessage(await this.remoteBackup.uploadBackup());
                                    this.getLastBackupDate();
                                }}
                                accessibilityLabel='Backup My Data'
                                color={GLOBALS.BUTTON_COLOR}
                            />
                            {this.state.lastBackupDate && (
                                <Button
                                    title='Restore from Backup'
                                    onPress={this.restoreFromBackup}
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
