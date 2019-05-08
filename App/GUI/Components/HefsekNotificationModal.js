import React from 'react';
import { Modal, Text, View, TouchableOpacity, Button } from 'react-native';
import TimePicker from './TimePicker';
import { addNotification } from '../../Code/Notifications';
import { range } from '../../Code/GeneralUtils';
import Utils from '../../Code/JCal/Utils';
import { GeneralStyles } from '../styles';

export default class HefsekNotificationModal extends React.Component {
    constructor(props) {
        super(props);

        const location = props.location,
            { jdate, taharaEventType, taharaEventId } = props.hefsekTaharaEvent,
            { sunrise, sunset } = jdate.getSunriseSunset(location);

        this.state = {
            location,
            jdate,
            taharaEventType,
            taharaEventId,
            sunrise,
            sunset,
            morningTime: { hour: sunrise.hour + 2, minute: 0 },
            afternoonTime: { hour: sunset.hour - 2, minute: 0 },
            mikvaReminderTime: { hour: sunset.hour + 1, minute: 0 },
        };

        this.onSetMorning = this.onSetMorning.bind(this);
        this.onSetAfternoon = this.onSetAfternoon.bind(this);
        this.onSetMikvah = this.onSetMikvah.bind(this);
    }
    onSetMorning() {
        const { morningTime } = this.state;
        for (let i of range(7)) {
            const dt = this.state.jdate.addDays(i).getDate();
            dt.setHours(morningTime.hour);
            dt.setMinutes(morningTime.minute);

            addNotification(
                `${this.state.taharaEventId}${i}`,
                'Luach - B. Reminder',
                `Today is the ${Utils.toSuffixed(
                    i
                )} day of the 7.\nThis is a reminder to do the morning B.`,
                dt
            );
        }
    }
    onSetAfternoon() {
        const { afternoonTime } = this.state;
        for (let i of range(7)) {
            const dt = this.state.jdate.addDays(i).getDate();
            dt.setHours(afternoonTime.hour);
            dt.setMinutes(afternoonTime.minute);

            addNotification(
                `${this.state.taharaEventId}${i + 10}`,
                'Luach - B. Reminder',
                `Today is the ${Utils.toSuffixed(
                    i
                )} day of the 7.\nThis is a reminder to do the afternoon B.`,
                dt
            );
        }
    }
    onSetMikvah() {
        const { mikvaReminderTime } = this.state,
            dt = this.state.jdate.addDays(7).getDate();
        dt.setHours(mikvaReminderTime.hour);
        dt.setMinutes(mikvaReminderTime.minute);

        addNotification(
            `${this.state.taharaEventId}${20}`,
            'Luach - M. Reminder',
            'This is a reminder to go to the M. tonight',
            dt
        );
    }
    render() {
        const { jdate } = this.props;
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
                            backgroundColor: '#333',
                            borderRadius: 10,
                            padding: 20,
                            width: '90%',
                        }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}>
                            <View style={GeneralStyles.centeredRow}>
                                <Text
                                    style={{
                                        fontSize: 20,
                                        color: '#d8d5f1',
                                        fontWeight: 'bold',
                                    }}>
                                    Bedikah and Mikva Notifications{'\n'}
                                </Text>
                            </View>
                            <Button title="Close" />
                        </View>
                        <View
                            style={{
                                backgroundColor: '#d8d5f1',
                                borderRadius: 10,
                                paddingTop: 30,
                                paddingbottom: 30,
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
                                    Hefsek Tahara was done on {jdate.toString()}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: '#666',
                                    }}>
                                    I would like to be reminded to do the
                                    morning Bedikas during the Shiva Neki'im at{' '}
                                    <TimePicker
                                        time={this.state.morningTime}
                                        onChooseTime={morningTime =>
                                            this.setState({ morningTime })
                                        }
                                    />
                                    <Button
                                        onPress={() => this.onSetMorning()}
                                        title="Set"
                                    />
                                    {'\n\n\n'}
                                    I would like to be reminded to do the
                                    afternoon Bedikas during the Shiva Neki'im
                                    at
                                    <TimePicker
                                        time={this.state.afternoonTime}
                                        onChooseTime={afternoonTime =>
                                            this.setState({ afternoonTime })
                                        }
                                    />
                                    <Button
                                        onPress={() => this.onSetAfternoon()}
                                        title="Set"
                                    />
                                    {'\n\n\n'}
                                    I would like to be reminded about the
                                    upcoming Mikva night during the last day of
                                    the Shiva Neki'im at
                                    <TimePicker
                                        time={this.state.mikvaReminderTime}
                                        onChooseTime={mikvaReminderTime =>
                                            this.setState({ mikvaReminderTime })
                                        }
                                    />
                                    <Button
                                        onPress={() => this.onSetMikvah()}
                                        title="Set"
                                    />
                                    {'\n\n\n'}
                                </Text>

                                <Button
                                    onPress={() => this.props.onClose()}
                                    title="Cancel"
                                />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
}
