import React from 'react';
import { Text, View, Image } from 'react-native';
import { isSmallScreen } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default function Flash() {
    return <View style={{
        position: 'absolute',
        zIndex: 1,
        backgroundColor: '#eef',
        borderTopWidth: 2,
        borderColor: '#99a',
        padding: 10,
        width: '100%',
        bottom: 0
    }}>
        <View style={GeneralStyles.centeredRow}>
            <Image
                style={{ width: 20, height: 20, marginRight: 5 }}
                resizeMode='stretch'
                source={require('../Images/logo.png')} />
            <Text style={{
                fontSize: 25,
                color: '#909ACF',
                fontWeight: 'bold'
            }}>Luach</Text>
        </View>
        <View style={{ flexDirection: isSmallScreen() ? 'row' : 'column' }}>
            <Text style={{
                fontSize: 11,
                color: '#a66',
                fontWeight: 'bold'
            }}>PLEASE NOTE:<Text
                style={{ fontWeight: 'normal' }}> DO NOT rely exclusivley upon this application</Text></Text>
        </View>
    </View>;
}