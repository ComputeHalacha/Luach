import React from 'react';
import { Modal, Text, View, Image, TouchableOpacity } from 'react-native';
import { GLOBALS } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class FirstTimeModal extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Modal
                style={{ flex: 1 }}
                animationType="slide"
                transparent={false}
                onRequestClose={() => {
                    this.props.onClose();
                }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={() => {
                        this.props.onClose();
                    }}>
                    <View
                        style={{
                            backgroundColor: '#555',
                            borderTopWidth: 2,
                            borderColor: '#555',
                            borderRadius: 10,
                            padding: 20,
                            width: '90%',
                        }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}>
                            <View style={GeneralStyles.centeredRow}>
                                <Image
                                    style={{
                                        width: 60,
                                        height: 60,
                                        marginRight: 5,
                                    }}
                                    resizeMode="stretch"
                                    source={require('../Images/logo.png')}
                                />
                                <Text
                                    style={{
                                        fontSize: 60,
                                        color: '#909ACF',
                                        fontWeight: 'bold',
                                    }}>
                                    Luach
                                </Text>
                            </View>
                            <Text
                                style={{
                                    fontSize: 11,
                                    color: '#888',
                                }}>{`Version ${GLOBALS.VERSION_NAME}`}</Text>
                        </View>
                        <View
                            style={{
                                backgroundColor: '#d8d5f1',
                                borderRadius: 10,
                                paddingTop: 30,
                                paddingbottom: 30,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}>
                            <Text
                                style={{
                                    fontSize: 30,
                                    color: '#55a',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                }}>
                                Welcome to Luach!
                            </Text>
                            <Text
                                style={{
                                    fontSize: 15,
                                    color: '#666',
                                    width: '90%',
                                    textAlign: 'justify',
                                }}>
                                {'\n\n'}
                                To customize your Halachic or App settings, open
                                the Settings screen by pressing the "Settings"
                                button on the left.
                                {'\n\n'}
                                PLEASE NOTE: your initial location has been set
                                to "{this.props.locationName}".
                                {'\n\n'}
                                You can change this from the Settings screen as
                                well.
                                {'\n\n'}
                                For a detailed explanation about how to use
                                Luach, press on the "Help" button on the left.
                                {'\n\n\n'}
                                <Text
                                    style={{
                                        color: '#a44',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                    }}>
                                    IMPORTANT NOTE:
                                    <Text style={{ fontWeight: 'normal' }}>
                                        {' '}
                                        PLEASE{' '}
                                        <Text
                                            style={{
                                                textDecorationLine: 'underline',
                                                fontWeight: 'bold',
                                            }}>
                                            DO NOT
                                        </Text>{' '}
                                        rely exclusivley upon this application
                                        for Halachic matters.
                                    </Text>
                                </Text>
                                {'\n\n\n'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
}
