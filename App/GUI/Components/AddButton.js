import React from 'react';
import { Text, View, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import { GLOBALS } from '../../Code/GeneralUtils';

export default function AddButton(props) {
    return (
        <TouchableHighlight onPress={() => props.onPress()}>
            <View
                style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Icon
                    size={9}
                    reverse
                    name="add"
                    color={GLOBALS.BUTTON_COLOR}
                />
                <Text
                    style={{
                        color: GLOBALS.BUTTON_COLOR,
                        fontSize: 12,
                    }}>
                    {props.caption}
                </Text>
            </View>
        </TouchableHighlight>
    );
}
