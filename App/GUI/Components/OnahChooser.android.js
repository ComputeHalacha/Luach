import React from 'react';
import { View, Text, Picker } from 'react-native';
import Utils from '../../Code/JCal/Utils';
import jDate from '../../Code/JCal/jDate';
import { NightDay } from '../../Code/Chashavshavon/Onah';
import { range } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class OnahChooser extends React.Component {
    constructor(props) {
        super(props);
        const jdate = this.props.jdate;
        this.state = { jdate };
        this.setDate = this.props.setDate;
        this.changeDate = this.changeDate.bind(this);
    }
    changeDate(jdate) {
        this.setDate(jdate);
        this.setState({ jdate });
    }
    render() {
        const jdate = this.state.jdate,
            daysInMonth = jDate.daysJMonth(jdate.Year, jdate.Month),
            monthsInYear = jDate.monthsJYear(jdate.Year),
            days = range(1, daysInMonth),
            months = range(1, monthsInYear),
            years = range(jdate.Year - 30, jdate.Year).reverse();
        return <View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Day</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={Math.min(jdate.Day, daysInMonth)}
                    onValueChange={value => this.changeDate(new jDate(jdate.Year, jdate.Month, value))}>
                    {days.map(d =>
                        <Picker.Item label={d.toString()} value={d} key={d} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Month</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={Math.min(jdate.Month, monthsInYear)}
                    onValueChange={value => this.changeDate(new jDate(jdate.Year, value, jdate.Day))}>
                    {months.map(i =>
                        <Picker.Item label={Utils.jMonthsEng[i]} value={i} key={i} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Year</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={jdate.Year}
                    onValueChange={value => this.changeDate(new jDate(value, jdate.Month, jdate.Day))}>
                    {years.map(d =>
                        <Picker.Item label={d.toString()} value={d} key={d} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Onah - Day or Night?</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={this.props.nightDay}
                    onValueChange={value => this.props.setNightDay(value)}>
                    <Picker.Item label='Night' value={NightDay.Night} key={NightDay.Night} />
                    <Picker.Item label='Day' value={NightDay.Day} key={NightDay.Day} />
                </Picker>
            </View>
        </View>;
    }
}