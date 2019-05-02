import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { isSmallScreen, GLOBALS } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default function Flash() {
    const firstRun = global.IsFirstRun;
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
        <TouchableOpacity onPress={() => this.props.onClose()}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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
                <Text style={{
                    fontSize: 11,
                    color: '#888'
                }}>{`Version ${GLOBALS.VERSION_NAME}`}</Text>
            </View>
            {firstRun &&
                <View style={[GeneralStyles.centeredRow, { backgroundColor: '#fff' }]}>
                    <Text style={{
                        fontSize: 20,
                        color: '#800',
                        textAlign: 'center'
                    }}>Welcome to Luach!</Text>
                    <Text style={{
                        fontSize: 13,
                        color: '#a33',
                        textAlign: 'center'
                    }}>
                        To customize your Halachic or App settings, open the Settings screen
                        by pressing the "Settings" button on the left.
                        {'\n'}
                        PLEASE NOTE: your initial location has been set to "Lakewood New Jersey".
                        {'\n'}
                        You can change this from the Settings screen as well.
                        {'\n'}
                        For a detailed explanation about how to use Luach,
                        press on the "Help" button on the left.
                    </Text>
                </View>}
            <View style={{ flexDirection: isSmallScreen() ? 'row' : 'column' }}>
                <Text style={{
                    fontSize: 11,
                    color: '#a66',
                    fontWeight: 'bold'
                }}>PLEASE NOTE:<Text
                    style={{ fontWeight: 'normal' }}> DO NOT rely exclusivley upon this application</Text></Text>
            </View>
        </TouchableOpacity>
    </View>;
}