import React from 'react';
import { View, Text, Picker} from 'react-native';
import { UserOccasionTypes } from '../Code/JCal/UserOccasion';
import Utils from '../Code/JCal/Utils';
import { GeneralStyles } from './styles';

export default class OccasionTypeChooser extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const jmonthName = Utils.jMonthsEng[this.props.jdate.Month],
            jDay = Utils.toSuffixed(this.props.jdate.Day),
            sdate = this.props.jdate.getDate(),
            sMonthName = Utils.sMonthsEng[sdate.getMonth()],
            sDay = Utils.toSuffixed(sdate.getDate());
        return <View style={GeneralStyles.formRow}>
            <Text style={GeneralStyles.label}>Event/Occasion Type</Text>
            <Picker style={GeneralStyles.picker}
                accessibilityLabel='Select event type'
                prompt='Select event type'
                selectedValue={this.props.occasionType || 0}
                onValueChange={value => this.props.setOccasionType(value)}>
                <Picker.Item label={'One Time Occasion'}
                    value={UserOccasionTypes.OneTime} />
                <Picker.Item label={'Annual - ' + `${jmonthName} ${jDay}`}
                    value={UserOccasionTypes.HebrewDateRecurringYearly} />
                <Picker.Item label={'Annual - ' + `${sMonthName} ${sDay}`}
                    value={UserOccasionTypes.SecularDateRecurringYearly} />
                <Picker.Item label={'Monthly - ' + `${jDay} of Jewish Month`}
                    value={UserOccasionTypes.HebrewDateRecurringMonthly} />
                <Picker.Item label={'Monthly - ' + `${sDay} of Secular Month`}
                    value={UserOccasionTypes.SecularDateRecurringMonthly} />
            </Picker>
        </View>;
    }
}