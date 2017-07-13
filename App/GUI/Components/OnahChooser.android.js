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
        this.days = range(1, 30);
        this.months = range(1, 13);
        this.years = range(jdate.Year - 30, jdate.Year).reverse();

        this.changeDate = this.changeDate.bind(this);
    }
    changeDate(year, month, day) {
        //To prevent user from choosing a non-exiting month or day
        const daysInMonth = jDate.daysJMonth(year, month),
            monthsInYear = jDate.monthsJYear(year),
            jdate = new jDate(
                year,
                //Choosing Adar Sheini in a non-leap-year will set the month to Adar
                Math.min(month, monthsInYear),
                //Choosing day 30 in a non-full-month will set the day to 29
                Math.min(day, daysInMonth));

        this.setDate(jdate);
        this.setState({ jdate });
    }
    render() {
        const jdate = this.state.jdate;
        return <View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Day</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={jdate.Day}
                    onValueChange={value => this.changeDate(jdate.Year, jdate.Month, value)}>
                    {this.days.map(d =>
                        <Picker.Item label={d.toString()} value={d} key={d} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Month</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={jdate.Month}
                    onValueChange={value => this.changeDate(jdate.Year, value, jdate.Day)}>
                    {this.months.map(i =>
                        <Picker.Item label={Utils.jMonthsEng[i]} value={i} key={i} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Year</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={jdate.Year}
                    onValueChange={value => this.changeDate(value, jdate.Month, jdate.Day)}>
                    {this.years.map(d =>
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