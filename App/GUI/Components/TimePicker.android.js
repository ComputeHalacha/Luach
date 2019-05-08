import React, { Component } from 'react';
import {
    Text,
    TouchableHighlight,
    TimePickerAndroid,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Utils from '../../Code/JCal/Utils';

export default class TimePicker extends Component {
    constructor(props) {
        super(props);

        this.state = { chosenTime: props.time };

        this.setTime = this.setTime.bind(this);
    }

    /**
     *
     * @param {Date} date
     */
    async setTime() {
        const { action, hour, minute } = await TimePickerAndroid.open({
            hour: this.chosenTime.hour,
            minute: this.chosenTime.minute,
        });
        if (action !== TimePickerAndroid.dismissedAction) {
            this.setState({ chosenTime: { hour, minute } });
            this.props.onChooseTime(this.state.chosenTime);
        }
    }

    render() {
        return (
            <TouchableHighlight onPress={() => this.setTime()}>
                <Text>
                    {Utils.getTimeString(
                        this.state.chosenTime,
                        DeviceInfo.is24Hour()
                    )}
                </Text>
            </TouchableHighlight>
        );
    }
}
