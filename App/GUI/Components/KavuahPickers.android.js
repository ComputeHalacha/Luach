import React from 'react';
import { View, Text, Picker } from 'react-native';
import { Kavuah, KavuahTypes } from '../../Code/Chashavshavon/Kavuah';
import { range } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class KavuahPickers extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const nums = range(-100, 100);

        return <View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Kavuah Type</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={this.props.kavuahType}
                    onValueChange={value => this.props.setKavuahType(value)}>
                    <Picker.Item label='Haflaga' value={KavuahTypes.Haflagah} />
                    <Picker.Item label='Day Of Month' value={KavuahTypes.DayOfMonth} />
                    <Picker.Item label='Day Of Week' value={KavuahTypes.DayOfWeek} />
                    <Picker.Item label='"Dilug" of Haflaga' value={KavuahTypes.DilugHaflaga} />
                    <Picker.Item label='"Dilug" of Day Of Month' value={KavuahTypes.DilugDayOfMonth} />
                    <Picker.Item label='Sirug' value={KavuahTypes.Sirug} />
                    <Picker.Item label={'Haflaga with Ma\'ayan Pasuach'} value={KavuahTypes.HaflagaMaayanPasuach} />
                    <Picker.Item label={'Day Of Month with Ma\'ayan Pasuach'} value={KavuahTypes.DayOfMonthMaayanPasuach} />
                    <Picker.Item label='Haflaga of Onahs' value={KavuahTypes.HafalagaOnahs} />
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Setting Entry</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={this.props.settingEntry}
                    onValueChange={value => this.props.setSettingEntry(value)}>
                    {this.props.listOfEntries.map(entry =>
                        <Picker.Item label={entry.toString()} value={entry} key={entry.entryId} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>{Kavuah.getNumberDefinition(this.props.kavuahType)}</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={this.props.specialNumber}
                    onValueChange={value => this.props.setSpecialNumber(value)}>
                    {nums.map(num =>
                        (<Picker.Item key={num} label={num.toString()} value={num} />))}
                </Picker>
            </View>
        </View>;
    }
}