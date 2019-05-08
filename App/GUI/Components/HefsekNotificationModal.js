import React from 'react';
import {
    Modal,
    Text,
    View,
    TouchableOpacity,
    TouchableHighlight,
    Button,
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Divider, Icon } from 'react-native-elements';
import { addNotification } from '../../Code/Notifications';
import { GLOBALS, range } from '../../Code/GeneralUtils';
import Utils from '../../Code/JCal/Utils';
import { GeneralStyles } from '../styles';

const AddButton = props => (
    <TouchableHighlight onPress={() => props.onPress()}>
        <View
            style={{
                flexDirection: 'row',
                alignContent: 'center',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <Icon size={9} reverse name="add" color={GLOBALS.BUTTON_COLOR} />
            <Text
                style={{
                    color: GLOBALS.BUTTON_COLOR,
                    fontSize: 12,
                }}>
                Add Reminders
            </Text>
        </View>
    </TouchableHighlight>
);

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
            showMorningPicker: false,
            showAfternoonPicker: false,
            showMikvaPicker: false,
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
    getDatetime(time) {
        const d = new Date(0);
        d.setHours(time.hour, time.minute);
        return d;
    }
    getTime(date) {
        return { hour: date.getHours(), minute: date.getMinutes() };
    }
    render() {
        const { jdate } = this.state;
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
                                    },
                                ]}>
                                <Text
                                    style={{
                                        fontSize: 20,
                                        color: '#eee',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
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
                                    Hefsek Tahara was done on {jdate.toString()}
                                </Text>
                                <View
                                    style={{
                                        marginTop: 10,
                                    }}>
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
                                        <TouchableOpacity
                                            onPress={() =>
                                                this.setState({
                                                    showMorningPicker: true,
                                                })
                                            }>
                                            <View
                                                style={GeneralStyles.timeInput}>
                                                <Text>
                                                    {Utils.getTimeString(
                                                        this.state.morningTime
                                                    )}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                        <DateTimePicker
                                            isVisible={
                                                this.state.showMorningPicker
                                            }
                                            mode="time"
                                            date={this.getDatetime(
                                                this.state.morningTime
                                            )}
                                            onConfirm={morningDate =>
                                                this.setState({
                                                    morningTime: this.getTime(
                                                        morningDate
                                                    ),
                                                    showMorningPicker: false,
                                                })
                                            }
                                            onCancel={() =>
                                                this.setState({
                                                    showMorningPicker: false,
                                                })
                                            }
                                        />
                                        <Text> each day </Text>
                                        <AddButton
                                            onPress={() => this.onSetMorning()}
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
                                        <TouchableOpacity
                                            onPress={() =>
                                                this.setState({
                                                    showAfternoonPicker: true,
                                                })
                                            }>
                                            <View
                                                style={GeneralStyles.timeInput}>
                                                <Text>
                                                    {Utils.getTimeString(
                                                        this.state.afternoonTime
                                                    )}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                        <DateTimePicker
                                            isVisible={
                                                this.state.showAfternoonPicker
                                            }
                                            mode="time"
                                            date={this.getDatetime(
                                                this.state.afternoonTime
                                            )}
                                            onConfirm={afternoonDate =>
                                                this.setState({
                                                    afternoonTime: this.getTime(
                                                        afternoonDate
                                                    ),
                                                    showAfternoonPicker: false,
                                                })
                                            }
                                            onCancel={() =>
                                                this.setState({
                                                    showAfternoonPicker: false,
                                                })
                                            }
                                        />
                                        <Text> each day </Text>
                                        <AddButton
                                            onPress={() =>
                                                this.onSetAfternoon()
                                            }
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
                                        <TouchableOpacity
                                            onPress={() =>
                                                this.setState({
                                                    showMikvaPicker: true,
                                                })
                                            }>
                                            <View
                                                style={GeneralStyles.timeInput}>
                                                <Text>
                                                    {Utils.getTimeString(
                                                        this.state
                                                            .mikvaReminderTime
                                                    )}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                        <DateTimePicker
                                            isVisible={
                                                this.state.showMikvaPicker
                                            }
                                            mode="time"
                                            date={this.getDatetime(
                                                this.state.mikvaReminderTime
                                            )}
                                            onConfirm={mikvaDate =>
                                                this.setState({
                                                    mikvaReminderTime: this.getTime(
                                                        mikvaDate
                                                    ),
                                                    showMikvaPicker: false,
                                                })
                                            }
                                            onCancel={() =>
                                                this.setState({
                                                    showMikvaPicker: false,
                                                })
                                            }
                                        />
                                        <AddButton
                                            onPress={() => this.onSetMikvah()}
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
