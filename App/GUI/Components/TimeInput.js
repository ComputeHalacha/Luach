import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import DeviceInfo from 'react-native-device-info';
import Utils from '../../Code/JCal/Utils';
import { GeneralStyles } from '../styles';

export default class TimeInput extends React.Component {
    constructor(props) {
        super(props);
        this.armyTime = DeviceInfo.is24Hour();

        this.state = {
            showPicker: false,
            selectedTime: props.selectedTime,
        };
    }
    getDatetime(time) {
        const d = new Date(0);
        d.setHours(time.hour, time.minute, 0, 0);
        return d;
    }
    getTime(date) {
        return { hour: date.getHours(), minute: date.getMinutes() };
    }
    render() {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                <TouchableOpacity
                    onPress={() =>
                        this.setState({
                            showPicker: true,
                        })
                    }>
                    <View style={GeneralStyles.timeInput}>
                        <Text>
                            {Utils.getTimeString(
                                this.state.selectedTime,
                                this.armyTime
                            )}
                        </Text>
                    </View>
                </TouchableOpacity>
                <DateTimePicker
                    isVisible={this.state.showPicker}
                    mode="time"
                    is24Hour={this.armyTime}
                    date={this.getDatetime(this.state.selectedTime)}
                    onConfirm={d => {
                        const selectedTime = this.getTime(d);
                        this.setState({
                            selectedTime,
                            showPicker: false,
                        });
                        if (this.props.onConfirm) {
                            this.props.onConfirm(selectedTime);
                        }
                    }}
                    onCancel={() => {
                        this.setState({
                            showPicker: false,
                        });
                        if (this.props.onCancel) {
                            this.props.onCancel();
                        }
                    }}
                />
            </View>
        );
    }
}
