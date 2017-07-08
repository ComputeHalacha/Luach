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
    }
    render() {
        const jdate = this.props.jdate,
            years = range(jdate.Year - 30, jdate.Year).reverse(),
            daysOfMonth = range(1, 30);
        return <View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Day</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={jdate.Day}
                    onValueChange={value => this.props.setDate(new jDate(jdate.Year, jdate.Month, value))}>
                    {daysOfMonth.map(d =>
                        <Picker.Item label={d.toString()} value={d} key={d} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Month</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={jdate.Month}
                    onValueChange={value => this.props.setDate(new jDate(jdate.Year, value, jdate.Day))}>
                    {Utils.jMonthsEng.map((m, i) =>
                        <Picker.Item label={m || 'Choose a Month'} value={i} key={i} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Year</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={jdate.Year}
                    onValueChange={value => this.props.setDate(new jDate(value, jdate.Month, jdate.Day))}>
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