import React from 'react';
import { View, Text } from 'react-native';
import { Select, Option } from 'react-native-chooser';
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
        this.years = range(jdate.Year - 30, jdate.Year).reverse();
        this.daysOfMonth = range(1, 30);
        this.setDate = this.props.setDate;
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
                <Select
                    onSelect={value => this.changeDate(jdate.Year, jdate.Month, value)}
                    defaultText={jdate.Day.toString()}
                    style={GeneralStyles.select}
                    indicator='down'
                    transparent={true}
                    backdropStyle={GeneralStyles.optionListBackdrop}
                    optionListStyle={GeneralStyles.optionListStyle}>
                    {this.daysOfMonth.map(d =>
                        <Option value={d} key={d}>{d.toString()}</Option>
                    )}
                </Select>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Month</Text>
                <Select
                    onSelect={value => this.changeDate(jdate.Year, value, jdate.Day)}
                    defaultText={Utils.jMonthsEng[jdate.Month]}
                    style={GeneralStyles.select}
                    indicator='down'
                    transparent={true}
                    backdropStyle={GeneralStyles.optionListBackdrop}
                    optionListStyle={GeneralStyles.optionListStyle}>
                    {Utils.jMonthsEng.filter(m => m).map((m, i) =>
                        <Option value={i + 1} key={i}>{m}</Option>
                    )}
                </Select>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Year</Text>
                <Select
                    onSelect={value => this.changeDate(value, jdate.Month, jdate.Day)}
                    defaultText={jdate.Year.toString()}
                    style={GeneralStyles.select}
                    indicator='down'
                    transparent={true}
                    backdropStyle={GeneralStyles.optionListBackdrop}
                    optionListStyle={GeneralStyles.optionListStyle}>
                    {this.years.map(d =>
                        <Option value={d} key={d}>{d.toString()}</Option>
                    )}
                </Select>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Onah - Day or Night?</Text>
                <Select
                    onSelect={value => this.props.setNightDay(value)}
                    defaultText={this.props.nightDay === NightDay.Night ? 'Night' : 'Day'}
                    style={GeneralStyles.select}
                    indicator='down'
                    transparent={true}
                    backdropStyle={GeneralStyles.optionListBackdrop}
                    optionListStyle={GeneralStyles.optionListStyle}>
                    <Option value={NightDay.Night}>Night</Option>
                    <Option value={NightDay.Day}>Day</Option>
                </Select>
            </View>
        </View>;
    }
}