import React from 'react';
import { View, Picker } from 'react-native';
import { GeneralStyles } from '../styles';

export default function BorderedPicker(props) {
    return (
        <View style={[props.viewStyle, GeneralStyles.timeInput]}>
            <Picker {...props} style={[GeneralStyles.picker, props.style]}>
                {props.children}
            </Picker>
        </View>
    );
}
