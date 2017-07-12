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
        this.state = {
            day: jdate.Day,
            month: jdate.Month,
            year: jdate.Year,
            months: range(0, jDate.monthsJYear(jdate.Year)),
            daysOfMonth: range(1, jDate.daysJMonth(jdate.Year, jdate.Month))
        };
        this.years = range(jdate.Year - 30, jdate.Year).reverse();
        this.setDate = this.props.setDate;
    }
    onDayChanged(day) {
        const jdate = new jDate(this.state.year, this.state.month, day);
        this.setState({ day });
        this.setDate(jdate);
    }
    onMonthChanged(month) {
        const daysInMonth = jDate.daysJMonth(this.state.year, month),
            jdate = new jDate(
                this.state.year,
                month,
                Math.min(this.state.day, daysInMonth));
        this.setState({ month, day: jdate.Day, daysOfMonth: range(1, daysInMonth) });
        this.setDate(jdate);
    }
    onYearChanged(year) {
        const daysInMonth = jDate.daysJMonth(year, this.state.month),
            monthsInYear = jDate.monthsJYear(year),
            jdate = new jDate(
                year,
                Math.min(this.state.month, monthsInYear),
                Math.min(this.state.day, daysInMonth));
        this.setState({
            year,
            day: jdate.Day,
            months: range(0, monthsInYear),
            daysOfMonth: range(1, daysInMonth)
        });
        this.setDate(jdate);
    }
    render() {
        return <View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Day</Text>
                <Picker ref={pickDay => this.pickDay = pickDay}
                    style={GeneralStyles.picker}
                    selectedValue={this.state.day}
                    onValueChange={this.onDayChanged.bind(this)}>
                    {this.state.daysOfMonth.map(d =>
                        <Picker.Item label={d.toString()} value={d} key={d} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Month</Text>
                <Picker ref={pickMonth => this.pickMonth = pickMonth}
                    style={GeneralStyles.picker}
                    selectedValue={this.state.month}
                    onValueChange={this.onMonthChanged.bind(this)}>
                    {this.state.months.map(i =>
                        <Picker.Item label={Utils.jMonthsEng[i] || 'Choose a Month'} value={i} key={i} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Year</Text>
                <Picker ref={pickYear => this.pickYear = pickYear}
                    style={GeneralStyles.picker}
                    selectedValue={this.state.year}
                    onValueChange={this.onYearChanged.bind(this)}>
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