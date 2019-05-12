import React from 'react';
import {
    Modal,
    Text,
    View,
    TouchableOpacity,
    Button,
} from 'react-native';
import { Divider, Icon } from 'react-native-elements';
import DeviceInfo from 'react-native-device-info';
import TimeInput from './TimeInput';
import AddButton from './AddButton';
import {
    addBedikaAlarms,
    addMikvaAlarm,
    cancelAllBedikaAlarms,
    cancelMikvaAlarm,
} from '../../Code/Notifications';
import { GLOBALS, popUpMessage } from '../../Code/GeneralUtils';
import Utils from '../../Code/JCal/Utils';
import { GeneralStyles } from '../styles';

const armyTime = DeviceInfo.is24Hour();

export default class HefsekNotificationModal extends React.Component {
    constructor(props) {
        super(props);

        const location = props.location,
            { jdate, taharaEventType, taharaEventId } = props.hefsekTaharaEvent,
            { sunrise, sunset } = jdate.getSunriseSunset(location);

        this.location = location;
        this.discreet = this.props.discreet;
        this.jdate = jdate;
        this.taharaEventType = taharaEventType;
        this.taharaEventId = taharaEventId;
        this.sunrise = sunrise;
        this.sunset = sunset;
        

        this.state = {
            morningTime: { hour: sunrise.hour + 2, minute: 0 },
            afternoonTime: { hour: sunset.hour - 2, minute: 0 },
            mikvaReminderTime: { hour: sunset.hour + 1, minute: 0 },
        };

        this.onSetMorning = this.onSetMorning.bind(this);
        this.onSetAfternoon = this.onSetAfternoon.bind(this);
        this.onSetMikvah = this.onSetMikvah.bind(this);
    }
    onSetMorning() {
        addBedikaAlarms(
            this.jdate,
            'morning',
            this.taharaEventId,
            this.state.morningTime,
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
            this.state.afternoonTime,
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
            <Modal
                style={{ flex: 1, backgroundColor: '#fff' }}
                animationType="fade"
                transparent={true}
                onRequestClose={() => {
                    this.props.onClose();
                }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={() => {
                        this.props.onClose();
                    }}>
                    <View
                        style={{
                            backgroundColor: '#777',
                            borderRadius: 10,
                            padding: 10,
                            width: '90%',
                        }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}>
                            <View
                                style={[
                                    GeneralStyles.centeredRow,
                                    {
                                        backgroundColor: '#99e',
                                        width: '100%',
                                        borderTopLeftRadius: 10,
                                        borderTopRightRadius: 10,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    },
                                ]}>
                                <Text
                                    style={{
                                        fontSize: 20,
                                        color: '#eee',
                                        fontWeight: 'bold',
                                        padding: 10,
                                    }}>
                                    Bedika and Mikva Notifications
                                </Text>
                            </View>
                        </View>
                        <View
                            style={{
                                backgroundColor: '#d8d5f1',
                                borderBottomLeftRadius: 10,
                                borderBottomRightRadius: 10,
                                padding: 10,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}>
                            <View
                                style={{
                                    width: '90%',
                                }}>
                                <Text
                                    style={{
                                        fontSize: 18,
                                        color: '#55a',
                                        fontWeight: 'bold',
                                    }}>
                                    Hefsek Tahara was done on{' '}
                                    {this.jdate.toString()}
                                </Text>
                                <Text style={{ fontSize: 13 }}>
                                    {`Sunrise: ${Utils.getTimeString(
                                        this.sunrise,
                                        armyTime
                                    )}, Sunset: ${Utils.getTimeString(
                                        this.sunset,
                                        armyTime
                                    )}`}
                                </Text>
                                <View
                                    style={{
                                        marginTop: 10,
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            cancelAllBedikaAlarms(
                                                this.taharaEventId
                                            );
                                            cancelMikvaAlarm();
                                            popUpMessage(
                                                'All system reminders pertaining to this Hefsek Tahara have been removed'
                                            );
                                        }}>
                                        <View
                                            style={{
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                            }}>
                                            <Icon
                                                name="delete-forever"
                                                color="#966"
                                                size={20}
                                            />
                                            <Text
                                                style={{
                                                    fontSize: 11,
                                                    color: '#966',
                                                }}>
                                                Cancel all previous
                                                notifications for this Hefsek
                                                Tahara
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <Divider style={GeneralStyles.divider} />
                                    <Text>
                                        I would like to add system reminders to
                                        do the morning Bedika during the Shiva
                                        Neki'im
                                    </Text>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                        <Text>at </Text>
                                        <TimeInput
                                            selectedTime={
                                                this.state.morningTime
                                            }
                                            onConfirm={morningTime =>
                                                this.setState({ morningTime })
                                            }
                                        />
                                        <Text> each day </Text>
                                        <AddButton
                                            onPress={() => this.onSetMorning()}
                                            caption='Add Reminders'
                                        />
                                    </View>
                                </View>
                                <Divider style={GeneralStyles.divider} />
                                <View
                                    style={{
                                        marginTop: 10,
                                    }}>
                                    <Text>
                                        I would like to add system reminders to
                                        do the afternoon Bedika during the Shiva
                                        Neki'im
                                    </Text>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                        <Text>at </Text>
                                        <TimeInput
                                            selectedTime={
                                                this.state.afternoonTime
                                            }
                                            onConfirm={afternoonTime =>
                                                this.setState({ afternoonTime })
                                            }
                                        />
                                        <Text> each day </Text>
                                        <AddButton
                                            onPress={() =>
                                                this.onSetAfternoon()
                                            }
                                            caption='Add Reminders'
                                        />
                                    </View>
                                </View>
                                <Divider style={GeneralStyles.divider} />
                                <View
                                    style={{
                                        marginTop: 10,
                                    }}>
                                    <Text>
                                        I would like to add system reminders
                                        about the upcoming Mikva night on the
                                        last day of the Shiva Neki'im
                                    </Text>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                        <Text>at </Text>
                                        <TimeInput
                                            selectedTime={
                                                this.state.mikvaReminderTime
                                            }
                                            onConfirm={mikvaReminderTime =>
                                                this.setState({
                                                    mikvaReminderTime,
                                                })
                                            }
                                        />
                                        <AddButton
                                            onPress={() => this.onSetMikvah()}
                                            caption='Add Reminders'
                                        />
                                    </View>
                                </View>
                                <Divider style={GeneralStyles.divider} />
                                <View style={{ margin: 10 }}>
                                    <Button
                                        onPress={() => this.props.onClose()}
                                        title="Close"
                                        accessibilityLabel="Close this box"
                                        color={GLOBALS.BUTTON_COLOR}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
}
