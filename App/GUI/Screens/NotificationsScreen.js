import React, { Component } from 'react';
import {
    ScrollView,
    TouchableHighlight,
    View,
    Text,
    TextInput,
    Picker,
    Switch,
} from 'react-native';
import { Icon } from 'react-native-elements';
import DeviceInfo from 'react-native-device-info';
import SideMenu from '../Components/SideMenu';
import TimeInput from './TimeInput';
import AddButton from './AddButton';
import Utils from '../../Code/JCal/Utils';
import { setDefault, range } from '../../Code/GeneralUtils';
import { GeneralStyles, popUpMessage } from '../styles';
import {
    addBedikaAlarms,
    cancelAllAlarms,
    addHefsekTaharaAlarm,
    addMikvaAlarm,
} from '../../Code/Notifications';
import TaharaEvent from '../../Code/Chashavshavon/TaharaEvent';

const armyTime = DeviceInfo.is24Hour();

export default class NotificationsScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        const { appData, onUpdate } = navigation.state.params;
        return {
            title: 'Reminders and Notifications',
            headerRight: (
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                    }}>
                    <TouchableHighlight onPress={() => cancelAllAlarms()}>
                        <View style={{ marginRight: 3 }}>
                            <Icon
                                name="delete-forever"
                                color="#966"
                                size={25}
                            />
                            <Text style={{ fontSize: 10, color: '#966' }}>
                                Cancel all reminders
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
        this.update = ad => {
            if (onUpdate) {
                onUpdate(ad);
            }
        };
        this.settings = appData.Settings;
        const location = this.settings.location,
            jdate = new jdate(),
            { sunrise, sunset } = jdate.getSunriseSunset(location);

        this.state = {
            mikvaReminderTime: { hour: sunset.hour + 1, minute: 0 },
            dayOnahReminderTime: { hour: sunrise.hour - 1, minute: 0 },
            nightOnahReminderTime: { hour: sunset.hour - 1, minute: 0 },
        };
    }

    render() {
        const settings = this.settings,
            lastHefsek = this.appData.TaharaEvents[
                this.appData.TaharaEvents.length - 1
            ],
            discreet = setDefault(settings.discreet, true);

        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.update}
                        appData={this.appData}
                        navigator={this.props.navigation}
                        hideSettings={false}
                        helpUrl="Settings.html"
                        helpTitle="Settings"
                    />
                    <ScrollView style={{ flex: 1 }}>
                        {lastHefsek && (
                            <LastHefsekSection
                                lastHefsek={lastHefsek}
                                location={this.location}
                                discreet={discreet}
                            />
                        )}
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Add </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={value =>
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
                                Show Entry, Hefsek Tahara and Mikva information?
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={value =>
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
                                Discreetly worded system reminders?
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={value =>
                                    this.changeSetting('discreet', value)
                                }
                                value={!!discreet}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Show flags for problem dates on Main Screen?
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={value =>
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
                                    onValueChange={value =>
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
                                Show explicitly ignored Kavuahs in the Kavuah
                                list
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={value =>
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
                                Don't show Flagged dates for a week after Entry
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={value =>
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
                                Hide Help Button
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={value =>
                                    this.changeSetting('hideHelp', value)
                                }
                                value={!!hideHelp}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Require PIN to open application?
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                onValueChange={value =>
                                    this.changeSetting('requirePIN', value)
                                }
                                value={!!requirePIN}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                4 digit PIN Number
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
                                    PIN must have 4 digits
                                </Text>
                            </View>
                            <TextInput
                                style={GeneralStyles.textInput}
                                keyboardType="numeric"
                                returnKeyType="next"
                                maxLength={4}
                                onChangeText={value => {
                                    this.changePIN(value);
                                }}
                                value={this.state.enteredPin}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}

class LastHefsekSection extends Component {
    constructor(props) {
        super(props);

        const { lastHefsek, discreet, location } = props,
            { jdate } = lastHefsek,
            { sunrise, sunset } = jdate.getSunriseSunset(location);

        this.location = location;
        this.jdate = jdate;
        this.taharaEventId = lastHefsek.taharaEventId;
        this.discreet = discreet;
        this.sunrise = sunrise;
        this.sunset = sunset;

        this.state = {
            mornBedRemTime: { hour: sunrise.hour + 2, minute: 0 },
            afternoonBedRemTime: { hour: sunset.hour - 2, minute: 0 },
            mikvaReminderTime: { hour: sunset.hour + 1, minute: 0 },
        };
    }
    onSetMorning() {
        addBedikaAlarms(
            this.jdate,
            'morning',
            this.taharaEventId,
            this.state.mornBedRemTime,
            this.discreet
        );
        popUpMessage(
            'Bedika reminders have been added for each morning of the Shiva Neki\'im'
        );
    }
    onSetAfternoon() {
        addBedikaAlarms(
            this.jdate,
            'afternoon',
            this.taharaEventId,
            this.state.afternoonBedRemTime,
            this.discreet
        );

        popUpMessage(
            'Bedika reminders have been added for each afternoon of the Shiva Neki\'im'
        );
    }
    onSetMikvah() {
        const { mikvaReminderTime } = this.state,
            reminderJdate = this.jdate.addDays(7),
            { sunset } = reminderJdate.getSunriseSunset(this.location);

        addMikvaAlarm(reminderJdate, mikvaReminderTime, sunset, this.discreet);
        popUpMessage(
            'A Mikva reminder has been added for the last day of the Shiva Neki\'im'
        );
    }
    render() {
        return (
            <View>
                <View style={GeneralStyles.headerView}>
                    <Text style={GeneralStyles.headerText}>
                        Bedika Reminders for{'\n'} last Hefsek Tahara on{' '}
                        {this.jdate.toString()}
                        {'/n'}
                        <Text style={{ fontSize: 12 }}>
                            {`Sunrise: ${Utils.getTimeString(
                                this.sunrise,
                                armyTime
                            )}, Sunset: ${Utils.getTimeString(
                                this.sunset,
                                armyTime
                            )}`}
                        </Text>
                    </Text>
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>
                        Reminders for Morning Bedikahs
                    </Text>
                    <Text>
                        I would like to add system reminders to do the morning
                        Bedika during the Shiva Neki'im
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                        <Text>at </Text>
                        <TimeInput
                            selectedTime={this.state.mornBedRemTime}
                            onConfirm={mornBedRemTime =>
                                this.setState({ mornBedRemTime })
                            }
                        />
                        <Text> each day </Text>
                        <AddButton
                            onPress={() => this.onSetMorning()}
                            caption="Add Reminders"
                        />
                    </View>
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>
                        Reminders for Afternoon Bedikahs
                    </Text>
                    <Text>
                        I would like to add system reminders to do the afternoon
                        Bedika during the Shiva Neki'im
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                        <Text>at </Text>
                        <TimeInput
                            selectedTime={this.state.afternoonBedRemTime}
                            onConfirm={afternoonBedRemTime =>
                                this.setState({ afternoonBedRemTime })
                            }
                        />
                        <Text> each day </Text>
                        <AddButton
                            onPress={() => this.onSetAfternoon()}
                            caption="Add Reminders"
                        />
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>
                            Reminders for Mikvah
                        </Text>
                        <Text>
                            I would like to add system reminders about the
                            upcoming Mikva night on the last day of the Shiva
                            Neki'im
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <Text>at </Text>
                            <TimeInput
                                selectedTime={this.state.mikvaReminderTime}
                                onConfirm={mikvaReminderTime =>
                                    this.setState({
                                        mikvaReminderTime,
                                    })
                                }
                            />
                            <AddButton
                                onPress={() => this.onSetMikvah()}
                                caption="Add Reminders"
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
