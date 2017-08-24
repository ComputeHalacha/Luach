import React from 'react';
import { View, Text } from 'react-native';
import { Select, Option } from 'react-native-chooser';
import { Kavuah, KavuahTypes } from '../../Code/Chashavshavon/Kavuah';
import { range } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class KavuahPickers extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        const nums = range(-100, 100);

        return <View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Kavuah Type</Text>
                <Select
                    onSelect={value => this.props.setKavuahType(value)}
                    defaultText={Kavuah.getKavuahTypeText(this.props.kavuahType)}
                    style={GeneralStyles.select}
                    indicator='down'
                    transparent={true}
                    backdropStyle={GeneralStyles.optionListBackdrop}
                    optionListStyle={GeneralStyles.optionListStyle}>
                    <Option value={KavuahTypes.Haflagah}>{Kavuah.getKavuahTypeText(KavuahTypes.Haflagah)}</Option>
                    <Option value={KavuahTypes.DayOfMonth}>{Kavuah.getKavuahTypeText(KavuahTypes.DayOfMonth)}</Option>
                    <Option value={KavuahTypes.DayOfWeek}>{Kavuah.getKavuahTypeText(KavuahTypes.DayOfWeek)}</Option>
                    <Option value={KavuahTypes.DilugHaflaga}>{Kavuah.getKavuahTypeText(KavuahTypes.DilugHaflaga)}</Option>
                    <Option value={KavuahTypes.DilugDayOfMonth}>{Kavuah.getKavuahTypeText(KavuahTypes.DilugDayOfMonth)}</Option>
                    <Option value={KavuahTypes.Sirug}>{Kavuah.getKavuahTypeText(KavuahTypes.Sirug)}</Option>
                    <Option value={KavuahTypes.HaflagaMaayanPasuach}>{Kavuah.getKavuahTypeText(KavuahTypes.HaflagaMaayanPasuach)}</Option>
                    <Option value={KavuahTypes.DayOfMonthMaayanPasuach}>{Kavuah.getKavuahTypeText(KavuahTypes.DayOfMonthMaayanPasuach)}</Option>
                    <Option value={KavuahTypes.HafalagaOnahs}>{Kavuah.getKavuahTypeText(KavuahTypes.HafalagaOnahs)}</Option>
                </Select>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Setting Entry</Text>
                <Select
                    onSelect={value => this.props.setSettingEntry(value)}
                    defaultText={this.props.settingEntry.toString()}
                    style={GeneralStyles.select}
                    indicator='down'
                    transparent={true}
                    backdropStyle={GeneralStyles.optionListBackdrop}
                    optionListStyle={GeneralStyles.optionListStyle}>
                    {this.props.listOfEntries.map(entry =>
                        <Option value={entry} key={entry.entryId}>{entry.toString()}</Option>
                    )}
                </Select>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>{Kavuah.getNumberDefinition(this.props.kavuahType)}</Text>
                <Select
                    onSelect={value => this.props.setSpecialNumber(value)}
                    defaultText={this.props.specialNumber.toString()}
                    style={GeneralStyles.select}
                    indicator='down'
                    transparent={true}
                    backdropStyle={GeneralStyles.optionListBackdrop}
                    optionListStyle={GeneralStyles.optionListStyle}>
                    {nums.map(num =>
                        <Option key={num} value={num}>{num.toString()}</Option>
                    )}
                </Select>
            </View>
        </View>;
    }
}