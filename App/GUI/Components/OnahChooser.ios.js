import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { Select, Option } from 'react-native-chooser';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Utils from '../../Code/JCal/Utils';
import jDate from '../../Code/JCal/jDate';
import { NightDay } from '../../Code/Chashavshavon/Onah';
import { range } from '../../Code/GeneralUtils';
import OnahSynopsis from './OnahSynopsis';
import { GeneralStyles } from '../styles';

export default class OnahChooser extends React.Component {

    constructor(props) {
        super(props);
        const jdate = this.props.jdate;
        this.state = { jdate, showDatePicker: false };
        this.years = range(jdate.Year - 30, jdate.Year).reverse();
        this.daysOfMonth = range(1, 30);
        this.setDate = this.props.setDate;

        this.changeDate = this.changeDate.bind(this);
        this.changeSDate = this.changeSDate.bind(this);
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
    changeSDate(sdate) {
        const jdate = new jDate(sdate);
        this.changeDate(jdate.Year, jdate.Month, jdate.Day);
        this.setState({ showDatePicker: false });
    }
    render() {
        const jdate = this.state.jdate,
            isNight = this.props.nightDay === NightDay.Night;
        return <View>
            <OnahSynopsis {... { jdate, isNight }} />
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Secular Date</Text>
                <View style={GeneralStyles.textInput}>
                    <TouchableOpacity onPress={() => this.setState({ showDatePicker: true })}>
                        <Text>{Utils.toStringDate(jdate.getDate())}</Text>
                    </TouchableOpacity>
                    <DateTimePicker
                        isVisible={this.state.showDatePicker}
                        date={jdate.getDate()}
                        onConfirm={this.changeSDate}
                        onCancel={() => this.setState({ showDatePicker: false })}
                    />
                </View>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Jewish Day</Text>
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
                <Text style={GeneralStyles.label}>Jewish Month</Text>
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
                <Text style={GeneralStyles.label}>Jewish Year</Text>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                    <Text>Night</Text>
                    <Switch style={GeneralStyles.switch}
                        onValueChange={value =>
                            this.props.setNightDay(value ? NightDay.Day : NightDay.Night)}
                        value={!isNight} />
                    <Text>Day</Text>
                </View>
            </View>
        </View>;
    }
}