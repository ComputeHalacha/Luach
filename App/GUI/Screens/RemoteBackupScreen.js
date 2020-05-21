import React from 'react';
import { ScrollView, View, Text, Button, TextInput, Alert } from 'react-native';
import LocalStorage from '../../Code/Data/LocalStorage';
import SideMenu from '../Components/SideMenu';
import { GLOBALS, popUpMessage, isValidDate, confirm, goHomeToday } from '../../Code/GeneralUtils';
import Utils from '../../Code/JCal/Utils';
import { GeneralStyles } from '../styles';
import RemoteBackup from '../../Code/RemoteBackup';

export default class RemoteBackupScreen extends React.Component {
    static navigationOptions = {
        title: 'Backup and Restore',
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
        this.changeUsername = this.changeUsername.bind(this);
        this.changePassword = this.changePassword.bind(this);
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
                Alert.alert(
                    'Successfully restored from backup',
                    'The information has been successfully restored from the remote backup.\nLuach will now reset.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                goHomeToday(this.props.navigation, appData);
                            },
                        },
                    ]
                );
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

    changeUsername(userName) {
        if (userName && userName.length < 7) {
            popUpMessage(
                'Please choose a user name with at least 7 characters',
                'Invalid user Name'
            );
        } else if (userName && userName === this.state.localStorage.password) {
            popUpMessage(
                'Please choose a User Name that is not the same as your Password',
                'Invalid user name'
            );
        } else {
            this.changeLocalStorage('remoteUserName', userName);
        }
    }
    changePassword(password) {
        if (this.state.localStorage.remoteUserName && password.length < 7) {
            popUpMessage('Please choose a Password with at least 7 characters', 'Invalid password');
        } else if (password && password === this.state.localStorage.remoteUserName) {
            popUpMessage(
                'Please choose a Password that is not the same as your user name',
                'Invalid password'
            );
        } else {
            this.changeLocalStorage('remotePassword', password);
        }
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
                        <View style={GeneralStyles.headerView}>
                            {(this.state.lastBackupDate && (
                                <Text style={GeneralStyles.headerText}>
                                    Last Backup Date: {this.state.lastBackupDate}
                                </Text>
                            )) || <Text style={GeneralStyles.headerText}>No backup found</Text>}
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Remote backup user name</Text>
                            <TextInput
                                style={[GeneralStyles.textInput, GeneralStyles.monoFont]}
                                multiline={false}
                                onEndEditing={(e) => this.changeUsername(e.nativeEvent.text)}
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
                                style={[GeneralStyles.textInput, GeneralStyles.monoFont]}
                                multiline={false}
                                onEndEditing={(e) => this.changePassword(e.nativeEvent.text)}
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
                                    popUpMessage(
                                        await (await this.remoteBackup.createAccount()).message
                                    )
                                }
                                accessibilityLabel='Create an Account'
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
                            {this.state.lastBackupDate && (
                                <Button
                                    title='Restore from Backup'
                                    onPress={this.restoreFromBackup}
                                    accessibilityLabel='Restore from Backup'
                                    color={GLOBALS.BUTTON_COLOR}
                                />
                            )}
                            <Button
                                title='Backup My Data'
                                onPress={async () => {
                                    popUpMessage(
                                        await (await this.remoteBackup.uploadBackup()).message
                                    );
                                    this.getLastBackupDate();
                                }}
                                accessibilityLabel='Backup My Data'
                                color={GLOBALS.BUTTON_COLOR}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}
