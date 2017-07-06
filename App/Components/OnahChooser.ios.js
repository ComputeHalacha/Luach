import React from 'react';
import { View, Text } from 'react-native';
import { Select, Option } from 'react-native-chooser';
import Utils from '../Code/JCal/Utils';
import jDate from '../Code/JCal/jDate';
import { NightDay } from '../Code/Chashavshavon/Onah';
import { range } from '../Code/GeneralUtils';
import { GeneralStyles } from './styles';

export default class OnahChooser extends React.Component {

    constructor(props) {
        super(props);
    }
    render() {
        const jdate = this.props.jdate,
            years = range(jdate.Year - 30, jdate.Year).reverse(),
            daysOfMonth = range(1, 30);
        return <View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Day</Text>
                <Select
                    onSelect={value =>
                         this.props.setDate(new jDate(jdate.Year, jdate.Month, value))}
                    defaultText={jdate.Day.toString()}
                    style={GeneralStyles.select}
                    indicator='down'
                    transparent={true}
                    backdropStyle={GeneralStyles.optionListBackdrop}
                    optionListStyle={GeneralStyles.optionListStyle}>
                    {daysOfMonth.map(d =>
                        <Option value={d} key={d}>{d.toString()}</Option>
                    )}
                </Select>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Month</Text>
                <Select
                    onSelect={value =>
                        this.props.setDate(new jDate(jdate.Year, value, jdate.Day))}
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
                    onSelect={value =>
                        this.props.setDate(new jDate(value, jdate.Month, jdate.Day))}
                    defaultText={jdate.Year.toString()}
                    style={GeneralStyles.select}
                    indicator='down'
                    transparent={true}
                    backdropStyle={GeneralStyles.optionListBackdrop}
                    optionListStyle={GeneralStyles.optionListStyle}>
                    {years.map(d =>
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