import React, { Component } from 'react';
import { DatePickerIOS } from 'react-native';

const date = new Date();

export default class TimePicker extends Component {
    constructor(props) {
        super(props);

        this.state = { chosenTime: props.time };

        this.setTime = this.setTime.bind(this);
        this.getChosenAsDate = this.getChosenAsDate.bind(this);
    }

    /**
     *
     * @param {Date} date
     */
    setTime(date) {
        this.setState({
            chosenTime: {
                hour: date.getHours(),
                minute: date.getMinutes(),
            },
        });
        this.props.onChooseTime(this.state.chosenTime);
    }

    getChosenAsDate() {
        date.setHours(this.state.chosenTime.hour);
        date.setMinutes(this.state.chosenTime.minute);
        return date;
    }

    render() {
        return (
            <DatePickerIOS
                mode="time"
                date={this.getChosenAsDate()}
                onDateChange={this.setDate}
            />
        );
    }
}
