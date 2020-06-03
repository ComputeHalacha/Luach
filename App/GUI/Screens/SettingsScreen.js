import React, { Component } from 'react';
import {
    ScrollView,
    TouchableHighlight,
    View,
    Text,
    TextInput,
    Switch,
    StyleSheet,
} from 'react-native';
import { Icon } from 'react-native-elements';
import SideMenu from '../Components/SideMenu';
import Location from '../../Code/JCal/Location';
import Utils from '../../Code/JCal/Utils';
import { NightDay } from '../../Code/Chashavshavon/Onah';
import {
    setDefault,
    isNullishOrFalse,
    GLOBALS,
    popUpMessage,
    inform,
} from '../../Code/GeneralUtils';
import NumberPicker from '../Components/NumberPicker';
import TimeInput from '../Components/TimeInput';
import {
    removeAllDayOnahReminders,
    removeAllNightOnahReminders,
    cancelMikvaAlarm,
    cancelAllAfternoonBedikaAlarms,
    cancelAllMorningBedikaAlarms,
    resetDayOnahReminders,
    resetNightOnahReminders,
} from '../../Code/Notifications';
import { GeneralStyles } from '../styles';
import LocalStorage from '../../Code/Data/LocalStorage';

export default class SettingsScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        const { appData, onUpdate } = navigation.state.params;
        return {
            title: 'Settings',
            headerRight: (
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                    }}>
                    <TouchableHighlight
                        onPress={() =>
                            navigation.navigate('ExportData', {
                                appData,
                                dataSet: 'Settings',
                            })
                        }>
                        <View style={{ marginRight: 10 }}>
                            <Icon name="import-export" color="#aca" size={25} />
                            <Text style={{ fontSize: 10, color: '#797' }}>
                                Export Data
                            </Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                        onPress={() =>
                            navigation.navigate('RemoteBackup', {
                                onUpdate,
                                appData,
                            })
                        }>
                        <View style={{ marginRight: 10 }}>
                            <Icon name="backup" color="#88c" size={25} />
                            <Text style={{ fontSize: 10, color: '#559' }}>
                                Backup/Restore
                            </Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                        onPress={() =>
                            navigation.navigate('Browser', {
                                appData,
                                onUpdate,
                                url: 'index.html',
                                title: 'Help',
                            })
                        }>
                        <View style={{ marginRight: 3 }}>
                            <Icon name="help" color="#aac" size={25} />
                            <Text style={{ fontSize: 10, color: '#aac' }}>
                                Luach Help
                            </Text>
                        </View>
                    </TouchableHighlight>
                </View>
            ),
        };
    };
    constructor(props) {
        super(props);
        this.navigate = this.props.navigation.navigate;
        const { appData, onUpdate } = this.props.navigation.state.params;
        this.appData = appData;
        this.update = (ad) => {
            ad = ad || this.appData;
            this.setState({ settings: ad.Settings });
            if (onUpdate) {
                onUpdate(ad);
            }
        };
        this.state = {
            settings: appData.Settings,
            //The enteredPin is instead of settings.PIN in case the entered PIN is invalid.
            //We still want to display it, but not to change the setting.
            enteredPin: appData.Settings.PIN,
            enteredRemoteUserName: null,
            enteredRemotePassword: null,
            localStorage: new LocalStorage(),
        };
        this.changeSetting = this.changeSetting.bind(this);
        this.changeLocalStorage = this.changeLocalStorage.bind(this);
        this.changePIN = this.changePIN.bind(this);
        this.changeUsername = this.changeUsername.bind(this);
        this.changePassword = this.changePassword.bind(this);
    }
    async componentDidMount() {
        const localStorage = await LocalStorage.loadAll();
        this.setState({ localStorage });
    }
    changeSetting(name, value) {
        const settings = this.state.settings;
        settings[name] = value;
        settings.save();
        this.appData.Settings = settings;

        switch (name) {
            case 'remindBedkMornTime':
                if (!value) {
                    cancelAllMorningBedikaAlarms(
                        this.appData.TaharaEvents[
                            this.appData.TaharaEvents.length - 1
                        ]
                    );
                }
                break;
            case 'remindBedkAftrnHour':
                if (!value) {
                    cancelAllAfternoonBedikaAlarms(
                        this.appData.TaharaEvents[
                            this.appData.TaharaEvents.length - 1
                        ]
                    );
                }
                break;
            case 'remindMikvahTime':
                if (!value) {
                    cancelMikvaAlarm();
                }
                break;
            case 'remindDayOnahHour':
                if (value) {
                    const now = Utils.nowAtLocation(settings.location);

                    resetDayOnahReminders(
                        this.appData.ProblemOnahs.filter(
                            (po) =>
                                po.NightDay === NightDay.Day &&
                                po.jdate.Abs >= now.Abs
                        ),
                        value,
                        settings.location,
                        settings.discreet
                    );
                } else {
                    removeAllDayOnahReminders();
                }
                break;
            case 'remindNightOnahHour':
                if (value) {
                    const now = Utils.nowAtLocation(settings.location);

                    resetNightOnahReminders(
                        this.appData.ProblemOnahs.filter(
                            (po) =>
                                po.NightDay === NightDay.Night &&
                                po.jdate.Abs >= now.Abs
                        ),
                        value,
                        settings.location,
                        settings.discreet
                    );
                } else {
                    removeAllNightOnahReminders();
                }
                break;
            case 'autoBackup': {
                const localStorage = this.state.localStorage;
                if (
                    !localStorage.remoteUserName ||
                    !localStorage.remotePassword
                ) {
                    inform(
                        'To automatically backup your data when a new Entry is added, you need to enter a "remote user name" and "remote password" below.'
                    );
                }
                break;
            }
        }

        this.update(this.appData);
    }
    editLocation() {
        this.navigate('NewLocation', {
            appData: this.appData,
            location: this.appData.Settings.location,
            onUpdate: this.update,
        });
    }
    changeLocalStorage(name, val) {
        const localStorage = this.state.localStorage;
        //save value to device storage
        localStorage[name] = val;
        this.setState({ localStorage });
    }
    changePIN(pin) {
        const localStorage = this.state.localStorage,
            validPin = !pin || GLOBALS.VALID_PIN.test(pin);
        if (validPin) {
            localStorage.PIN = pin;
        }
        this.setState({ localStorage, invalidPin: !validPin, enteredPin: pin });
    }
    changeUsername(userName) {
        if (userName && userName.length < 7) {
            inform(
                'Please choose a User Name with at least 7 characters',
                'Invalid user Name'
            );
        } else if (userName && userName === this.state.localStorage.password) {
            inform(
                'Please choose a User Name that is not the same as your Password',
                'Invalid user name'
            );
        } else {
            this.changeLocalStorage('remoteUserName', userName);
        }
    }
    changePassword(password) {
        if (this.state.localStorage.remoteUserName && password.length < 7) {
            inform(
                'Please choose a Password with at least 7 characters',
                'Invalid password'
            );
        } else if (
            password &&
            password === this.state.localStorage.remoteUserName
        ) {
            inform(
                'Please choose a Password that is not the same as your User Name',
                'Invalid password'
            );
        } else {
            this.changeLocalStorage('remotePassword', password);
        }
    }
    render() {
        const settings = this.state.settings,
            localStorage = this.state.localStorage,
            location = settings.location || Location.getLakewood(),
            showOhrZeruah = setDefault(settings.showOhrZeruah, true),
            keepThirtyOne = setDefault(settings.keepThirtyOne, true),
            onahBeinunis24Hours = settings.onahBeinunis24Hours,
            numberMonthsAheadToWarn = settings.numberMonthsAheadToWarn || 12,
            keepLongerHaflagah = setDefault(settings.keepLongerHaflagah, true),
            dilugChodeshPastEnds = setDefault(
                settings.dilugChodeshPastEnds,
                true
            ),
            haflagaOfOnahs = settings.haflagaOfOnahs,
            kavuahDiffOnahs = settings.kavuahDiffOnahs,
            calcKavuahsOnNewEntry = setDefault(
                settings.calcKavuahsOnNewEntry,
                true
            ),
            showProbFlagOnHome = setDefault(settings.showProbFlagOnHome, true),
            showEntryFlagOnHome = setDefault(
                settings.showEntryFlagOnHome,
                true
            ),
            navigateBySecularDate = settings.navigateBySecularDate,
            showIgnoredKavuahs = settings.showIgnoredKavuahs,
            noProbsAfterEntry = setDefault(settings.noProbsAfterEntry, true),
            hideHelp = settings.hideHelp,
            discreet = setDefault(settings.discreet, true),
            autoBackup = setDefault(settings.autoBackup, true),
            remindBedkMornTime = settings.remindBedkMornTime,
            remindBedkAftrnHour = settings.remindBedkAftrnHour,
            remindMikvahTime = settings.remindMikvahTime,
            remindDayOnahHour = settings.remindDayOnahHour,
            remindNightOnahHour = settings.remindNightOnahHour,
            requirePin = !!localStorage.requirePin,
            enteredPin = this.state.enteredPin || localStorage.PIN,
            remoteUserName =
                this.state.enteredRemoteUserName || localStorage.remoteUserName,
            remotePassword =
                this.state.enteredRemotePassword || localStorage.remotePassword;

        return (
            <View>
                <View style={{ flexDirection: 'row' }}>
                    <SideMenu
                        onUpdate={this.update}
                        appData={this.appData}
                        navigator={this.props.navigation}
                        hideSettings={true}
                        helpUrl="Settings.html"
                        helpTitle="Settings"
                    />
                    <ScrollView style={GeneralStyles.container}>
                        <View style={GeneralStyles.headerView}>
                            <Text style={GeneralStyles.headerText}>
                                Halachic Settings
                            </Text>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Choose your location
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                <TouchableHighlight
                                    underlayColor="#9f9"
                                    onPress={() =>
                                        this.navigate('FindLocation', {
                                            onUpdate: this.update,
                                            appData: this.appData,
                                        })
                                    }
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#dfd',
                                    }}>
                                    <View style={GeneralStyles.centeredRow}>
                                        <Icon
                                            name="edit-location"
                                            color="#484"
                                            size={35}
                                        />
                                        <Text>{location.Name}</Text>
                                    </View>
                                </TouchableHighlight>
                                <Icon
                                    name="edit"
                                    color="#888"
                                    size={15}
                                    containerStyle={{
                                        paddingRight: 12,
                                        paddingLeft: 12,
                                    }}
                                    onPress={() => this.editLocation(location)}
                                />
                            </View>
                        </View>

                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Flag previous onah (The "Ohr Zaruah")
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting('showOhrZeruah', value)
                                }
                                value={!!showOhrZeruah}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Keep Onah Beinonis (30, 31 and Yom HaChodesh)
                                for a full 24 Hours
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting(
                                        'onahBeinunis24Hours',
                                        value
                                    )
                                }
                                value={!!onahBeinunis24Hours}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Keep day Thirty One for Onah Beinonis
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting('keepThirtyOne', value)
                                }
                                value={!!keepThirtyOne}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Haflaga is only cancelled by a longer one
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting(
                                        'keepLongerHaflagah',
                                        value
                                    )
                                }
                                value={!!keepLongerHaflagah}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Continue incrementing Dilug Yom Hachodesh
                                Kavuahs into another month
                            </Text>
                            <View style={{ flexDirection: 'row' }}>
                                {/*Without the folloiwng empty Text, the first NumberPicker below won't close its modal. I have absolutly no idea why.... */}
                                <Text />
                                <Switch
                                    style={GeneralStyles.switch}
                                    onValueChange={(value) =>
                                        this.changeSetting(
                                            'dilugChodeshPastEnds',
                                            value
                                        )
                                    }
                                    value={!!dilugChodeshPastEnds}
                                />
                            </View>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Calculate Haflagas by counting Onahs
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting('haflagaOfOnahs', value)
                                }
                                value={!!haflagaOfOnahs}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Flag Kavuahs even if not all the same Onah
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting('kavuahDiffOnahs', value)
                                }
                                value={!!kavuahDiffOnahs}
                            />
                        </View>
                        <View style={GeneralStyles.headerView}>
                            <Text style={GeneralStyles.headerText}>
                                Application Settings
                            </Text>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Calendar displays current:
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingLeft: 15,
                                }}>
                                <Text>Jewish Date</Text>
                                <Switch
                                    style={GeneralStyles.switch}
                                    onValueChange={(value) =>
                                        this.changeSetting(
                                            'navigateBySecularDate',
                                            value
                                        )
                                    }
                                    value={!!navigateBySecularDate}
                                />
                                <Text>Secular Date</Text>
                            </View>
                            {navigateBySecularDate && (
                                <Text
                                    style={{
                                        fontSize: 11,
                                        color: '#b55',
                                        paddingLeft: 10,
                                        paddingBottom: 5,
                                    }}>
                                    Please Note: If the current time is between
                                    sunset and midnight, the current Jewish date
                                    will be incorrect.
                                </Text>
                            )}
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Automatically Calculate Kavuahs upon addition of
                                an Entry
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting(
                                        'calcKavuahsOnNewEntry',
                                        value
                                    )
                                }
                                value={!!calcKavuahsOnNewEntry}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Don't show Flagged dates for a week after Entry
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting(
                                        'noProbsAfterEntry',
                                        value
                                    )
                                }
                                value={!!noProbsAfterEntry}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Number of Months ahead to warn
                            </Text>
                            <NumberPicker
                                style={{
                                    flex: 1,
                                    height: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                endNumber={24}
                                unitName="month"
                                value={numberMonthsAheadToWarn}
                                onChange={(value) =>
                                    this.changeSetting(
                                        'numberMonthsAheadToWarn',
                                        value
                                    )
                                }
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Show explicitly ignored Kavuahs in the Kavuah
                                list
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting(
                                        'showIgnoredKavuahs',
                                        value
                                    )
                                }
                                value={!!showIgnoredKavuahs}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Hide Help Button
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting('hideHelp', value)
                                }
                                value={!!hideHelp}
                            />
                        </View>
                        <View style={GeneralStyles.headerView}>
                            <Text style={GeneralStyles.headerText}>
                                Remote Backup Settings
                            </Text>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Remote backup user name
                            </Text>
                            <TextInput
                                style={[
                                    GeneralStyles.textInput,
                                    GeneralStyles.monoFont,
                                ]}
                                returnKeyType="next"
                                onSubmitEditing={(e) =>
                                    this.changeUsername(e.nativeEvent.text)
                                }
                                onChangeText={(val) =>
                                    this.setState({
                                        enteredRemoteUserName: val,
                                    })
                                }
                                onBlur={() =>
                                    this.setState({
                                        enteredRemoteUserName: remoteUserName,
                                    })
                                }
                                value={remoteUserName}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Remote backup password
                            </Text>
                            <TextInput
                                style={[
                                    GeneralStyles.textInput,
                                    GeneralStyles.monoFont,
                                ]}
                                returnKeyType="next"
                                onSubmitEditing={(e) =>
                                    this.changePassword(e.nativeEvent.text)
                                }
                                onChangeText={(val) =>
                                    this.setState({
                                        enteredRemotePassword: val,
                                    })
                                }
                                onBlur={() =>
                                    this.setState({
                                        enteredRemotePassword: remotePassword,
                                    })
                                }
                                value={remotePassword}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Automatically backup data when a new Entry is
                                added?
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting('autoBackup', value)
                                }
                                value={!!autoBackup}
                            />
                        </View>
                        <View style={GeneralStyles.headerView}>
                            <Text style={GeneralStyles.headerText}>
                                Reminders and Notifications
                            </Text>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Remind me about the morning Bedikah during Shiva
                                Neki'im'?
                            </Text>
                            <View style={localStyles.switchView}>
                                <Text>Don't add reminder</Text>
                                <Switch
                                    style={GeneralStyles.switch}
                                    onValueChange={(value) =>
                                        this.changeSetting(
                                            'remindBedkMornTime',
                                            value && { hour: 7, minute: 0 }
                                        )
                                    }
                                    value={!!remindBedkMornTime}
                                />
                                <Text>Add reminder</Text>
                            </View>
                            {remindBedkMornTime && (
                                <View style={localStyles.innerView}>
                                    <Text>Show reminder at </Text>
                                    <TimeInput
                                        selectedTime={remindBedkMornTime}
                                        onConfirm={(remindBedkMornTime) =>
                                            this.changeSetting(
                                                'remindBedkMornTime',
                                                remindBedkMornTime
                                            )
                                        }
                                    />
                                    <Text> each day</Text>
                                </View>
                            )}
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Remind me about the afternoon Bedikah during
                                Shiva Neki'im'?
                            </Text>
                            <View style={localStyles.switchView}>
                                <Text>Don't add reminder</Text>
                                <Switch
                                    style={GeneralStyles.switch}
                                    onValueChange={(value) =>
                                        this.changeSetting(
                                            'remindBedkAftrnHour',
                                            value && -1
                                        )
                                    }
                                    value={
                                        !isNullishOrFalse(remindBedkAftrnHour)
                                    }
                                />
                                <Text>Add reminder</Text>
                            </View>
                            {!isNullishOrFalse(remindBedkAftrnHour) && (
                                <View style={localStyles.innerView}>
                                    <Text>Show reminder </Text>
                                    <NumberPicker
                                        startNumber={0}
                                        endNumber={12}
                                        unitName="hour"
                                        value={Math.abs(remindBedkAftrnHour)}
                                        onChange={(value) =>
                                            this.changeSetting(
                                                'remindBedkAftrnHour',
                                                -value
                                            )
                                        }
                                    />
                                    <Text>{' before sunset'}</Text>
                                </View>
                            )}
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Remind me about the Mikvah on the last day of
                                Shiva Neki'im'?
                            </Text>
                            <View style={localStyles.switchView}>
                                <Text>Don't add reminder</Text>
                                <Switch
                                    style={GeneralStyles.switch}
                                    onValueChange={(value) =>
                                        this.changeSetting(
                                            'remindMikvahTime',
                                            value && { hour: 18, minute: 0 }
                                        )
                                    }
                                    value={!!remindMikvahTime}
                                />
                                <Text>Add reminder</Text>
                            </View>
                            {remindMikvahTime && (
                                <View style={localStyles.innerView}>
                                    <Text>Show reminder at </Text>
                                    <TimeInput
                                        selectedTime={remindMikvahTime}
                                        onConfirm={(remindMikvahTime) =>
                                            this.changeSetting(
                                                'remindMikvahTime',
                                                remindMikvahTime
                                            )
                                        }
                                    />
                                </View>
                            )}
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Remind me about Daytime flagged dates?
                            </Text>
                            <View style={localStyles.switchView}>
                                <Text>Don't add reminder</Text>
                                <Switch
                                    style={GeneralStyles.switch}
                                    onValueChange={(value) =>
                                        this.changeSetting(
                                            'remindDayOnahHour',
                                            value && -8
                                        )
                                    }
                                    value={!isNullishOrFalse(remindDayOnahHour)}
                                />
                                <Text>Add reminder</Text>
                            </View>
                            {!isNullishOrFalse(remindDayOnahHour) && (
                                <View style={localStyles.innerView}>
                                    <Text>Show the reminder </Text>
                                    <NumberPicker
                                        startNumber={0}
                                        endNumber={24}
                                        unitName="hour"
                                        value={Math.abs(remindDayOnahHour)}
                                        onChange={(value) =>
                                            this.changeSetting(
                                                'remindDayOnahHour',
                                                -value
                                            )
                                        }
                                    />
                                    <Text>{' before sunrise'}</Text>
                                </View>
                            )}
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Remind me about Nighttime flagged dates?
                            </Text>
                            <View style={localStyles.switchView}>
                                <Text>Don't add reminder</Text>
                                <Switch
                                    style={GeneralStyles.switch}
                                    onValueChange={(value) =>
                                        this.changeSetting(
                                            'remindNightOnahHour',
                                            value && -1
                                        )
                                    }
                                    value={
                                        !isNullishOrFalse(remindNightOnahHour)
                                    }
                                />
                                <Text>Add reminder</Text>
                            </View>
                            {!isNullishOrFalse(remindNightOnahHour) && (
                                <View style={localStyles.innerView}>
                                    <Text>Show the reminder </Text>
                                    <NumberPicker
                                        startNumber={0}
                                        endNumber={24}
                                        unitName="hour"
                                        value={Math.abs(remindNightOnahHour)}
                                        onChange={(value) =>
                                            this.changeSetting(
                                                'remindNightOnahHour',
                                                -value
                                            )
                                        }
                                    />
                                    <Text>{' before sunset'}</Text>
                                </View>
                            )}
                        </View>
                        <View style={GeneralStyles.headerView}>
                            <Text style={GeneralStyles.headerText}>
                                Privacy & Security
                            </Text>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Show Entry, Hefsek Tahara and Mikva information?
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting(
                                        'showEntryFlagOnHome',
                                        value
                                    )
                                }
                                value={!!showEntryFlagOnHome}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Show flags for problem dates on Main Screen?
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting(
                                        'showProbFlagOnHome',
                                        value
                                    )
                                }
                                value={!!showProbFlagOnHome}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Discreetly worded system reminders?
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeSetting('discreet', value)
                                }
                                value={!!discreet}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Require PIN to open application?
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={(value) =>
                                    this.changeLocalStorage('requirePin', value)
                                }
                                value={requirePin}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                PIN Number - minimum 4 digits
                            </Text>
                            <View
                                style={{
                                    display: this.state.invalidPin
                                        ? 'flex'
                                        : 'none',
                                    marginTop: 5,
                                    marginLeft: 10,
                                }}>
                                <Text
                                    style={{
                                        color: '#f55',
                                        fontSize: 12,
                                        fontWeight: 'bold',
                                    }}>
                                    PIN must contain at least 4 numbers
                                </Text>
                            </View>
                            <TextInput
                                style={[
                                    GeneralStyles.textInput,
                                    GeneralStyles.monoFont,
                                ]}
                                keyboardType="numeric"
                                returnKeyType="next"
                                onSubmitEditing={(e) => {
                                    this.changePIN(e.nativeEvent.text);
                                }}
                                onChangeText={(val) =>
                                    this.setState({ enteredPin: val })
                                }
                                value={enteredPin}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}
const localStyles = StyleSheet.create({
    innerView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#eef',
    },
    switchView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
    },
});
