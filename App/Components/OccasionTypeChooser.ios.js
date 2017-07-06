import React from 'react';
import { View, Text } from 'react-native';
import { Select, Option } from 'react-native-chooser';
import { UserOccasionTypes } from '../Code/JCal/UserOccasion';
import Utils from '../Code/JCal/Utils';
import { GeneralStyles } from './styles';

export default class OccasionTypeChooser extends React.Component {
    constructor(props) {
        super(props);
        this.getSelectedTypeDesc = this.getSelectedTypeDesc.bind(this);
    }
    getSelectedTypeDesc(occasionType) {
        if (!occasionType) {
            return;
        }
        const jdate = this.props.jdate,
            sdate = jdate.getDate();
        switch (this.props.occasionType) {
            case UserOccasionTypes.OneTime:
                return 'One Time Occasion';
            case UserOccasionTypes.HebrewDateRecurringYearly:
                return 'Annual - every ' +
                    `${Utils.jMonthsEng[jdate.Month]} ${Utils.toSuffixed(jdate.Day)}`;
            case UserOccasionTypes.SecularDateRecurringYearly:
                return 'Annual - every ' +
                    `${Utils.sMonthsEng[sdate.getMonth()]} ${Utils.toSuffixed(sdate.getDate())}`;
            case UserOccasionTypes.HebrewDateRecurringMonthly:
                return 'Monthly - every ' +
                    `${Utils.toSuffixed(jdate.Day)} of Jewish Month`;
            case UserOccasionTypes.SecularDateRecurringMonthly:
                return 'Monthly - every ' +
                    `${Utils.toSuffixed(sdate.getDate())} of Secular Month`;
        }
    }
    render() {
        return <View style={GeneralStyles.formRow}>
            <Text style={GeneralStyles.label}>Event/Occasion Type</Text>
            <Select
                onSelect={value => this.props.setOccasionType(value)}
                defaultText={this.getSelectedTypeDesc(this.props.occasionType) || 'Select event type'}
                style={GeneralStyles.select}
                indicator='down'
                transparent={true}
                backdropStyle={GeneralStyles.optionListBackdrop}
                optionListStyle={GeneralStyles.optionListStyle}>
                <Option value={UserOccasionTypes.OneTime}>
                    {this.getSelectedTypeDesc(UserOccasionTypes.OneTime)}
                </Option>
                <Option value={UserOccasionTypes.HebrewDateRecurringYearly}>
                    {this.getSelectedTypeDesc(UserOccasionTypes.HebrewDateRecurringYearly)}
                </Option>
                <Option value={UserOccasionTypes.SecularDateRecurringYearly}>
                    {this.getSelectedTypeDesc(UserOccasionTypes.SecularDateRecurringYearly)}
                </Option>
                <Option value={UserOccasionTypes.HebrewDateRecurringMonthly}>
                    {this.getSelectedTypeDesc(UserOccasionTypes.HebrewDateRecurringMonthly)}
                </Option>
                <Option value={UserOccasionTypes.SecularDateRecurringMonthly}>
                    {this.getSelectedTypeDesc(UserOccasionTypes.SecularDateRecurringMonthly)}
                </Option>
            </Select>
        </View>;
    }
}