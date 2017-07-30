import React from 'react';
import { View, Text, Picker, Switch, TouchableOpacity, DatePickerAndroid } from 'react-native';
import { Icon } from 'react-native-elements';
import Utils from '../../Code/JCal/Utils';
import jDate from '../../Code/JCal/jDate';
import { NightDay } from '../../Code/Chashavshavon/Onah';
import { range, warn } from '../../Code/GeneralUtils';
import OnahSynopsis from './OnahSynopsis';
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
        this.chooseSecularDate = this.chooseSecularDate.bind(this);
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
    async chooseSecularDate() {
        try {
            const { action, year, month, day } = await DatePickerAndroid.open({
                date: this.state.jdate.getDate()
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                const newDate = new Date(year, month, day),
                    jdate = new jDate(newDate);
                this.changeDate(jdate.Year, jdate.Month, jdate.Day);
            }
        } catch ({ code, message }) {
            warn('Cannot open date picker: ' + message);
        }
    }
    render() {
        const jdate = this.state.jdate,
            isNight = this.props.nightDay === NightDay.Night;
        return <View>
            <OnahSynopsis {... { jdate, isNight }} />
            <TouchableOpacity onPress={this.chooseSecularDate}>
                <View style={{ margin: 10, flexDirection: 'row'}}>
                    <Icon name='date-range' color='#55c' size={15} />
                    <Text style={{ marginLeft: 6, color: '#55c', textAlign: 'center', fontSize: 12 }}>
                        Choose secular date...</Text>
                </View>
            </TouchableOpacity>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                    <Text>Night</Text>
                    <Switch style={GeneralStyles.switch}
                        onValueChange={value =>
                            this.props.setNightDay(value ? NightDay.Day : NightDay.Night)}
                        value={!isNight} />
                    <Text>Day</Text>
                </View>
            </View>
        </View >;
    }
}
