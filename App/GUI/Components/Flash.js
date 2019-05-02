import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { isSmallScreen, GLOBALS } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class Flash extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const firstRun = global.IsFirstRun;
        return <View style={{
            position: 'absolute',
            zIndex: 1,
            backgroundColor: firstRun ? '#555' : '#eef',
            borderTopWidth: 2,
            borderColor: firstRun ? '#555' : '#99a',
            borderRadius: firstRun ? 10 : null,
            padding: firstRun ? 20 : 10,
            width: firstRun ? '96%' : '100%',
            height: firstRun ? '90%' : null,
            left: firstRun ? '2%' : null,
            top: firstRun ? '5%' : null,
            bottom: firstRun ? null : 0,
        }}>
            <TouchableOpacity onPress={() => this.props.onClose()}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={GeneralStyles.centeredRow}>
                        <Image
                            style={{ width: firstRun ? 60 : 20, height: firstRun ? 60 : 20, marginRight: 5 }}
                            resizeMode='stretch'
                            source={require('../Images/logo.png')} />
                        <Text style={{
                            fontSize: firstRun ? 60 : 25,
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
                    <View style={{ backgroundColor: '#d8d5f1', borderRadius: 10, paddingTop: 30, paddingbottom: 30, justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                        <Text style={{
                            fontSize: 30,
                            color: '#55a',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>Welcome to Luach!</Text>
                        <Text style={{
                            fontSize: 15,
                            color: '#666',
                            width: '90%',
                            textAlign: 'justify'
                        }}>
                            {'\n\n'}
                            To customize your Halachic or App settings, open the Settings screen
                            by pressing the "Settings" button on the left.
                        {'\n\n'}
                            PLEASE NOTE: your initial location has been set to "Lakewood New Jersey".
                        {'\n\n'}
                            You can change this from the Settings screen as well.
                        {'\n\n'}
                            For a detailed explanation about how to use Luach,
                            press on the "Help" button on the left.
                            {'\n\n\n'}
                            <Text style={{
                                color: '#a44',
                                fontSize: 16,
                                fontWeight: 'bold'
                            }}>IMPORTANT NOTE:
                            <Text style={{ fontWeight: 'normal' }}> DO NOT rely exclusivley upon this application</Text></Text>
                            {'\n\n\n'}
                        </Text>
                    </View>}
                {!firstRun &&
                    <View style={{ flexDirection: isSmallScreen() ? 'row' : 'column' }}>
                        <Text style={{
                            fontSize: 11,
                            color: '#a66',
                            fontWeight: 'bold'
                        }}>PLEASE NOTE:<Text
                            style={{ fontWeight: 'normal' }}> DO NOT rely exclusivley upon this application</Text></Text>
                    </View>
                }
            </TouchableOpacity>
        </View>;
    }
}