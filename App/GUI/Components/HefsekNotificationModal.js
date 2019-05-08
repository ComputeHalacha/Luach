import React from 'react';
import {
    Modal,
    Text,
    View,
    Image,
    TouchableOpacity,
    Button,
} from 'react-native';
import { GeneralStyles } from '../styles';

export default class HefsekNotificationModal extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { jdate } = this.props;
        return (
            <Modal
                style={{ flex: 1, backgroundColor: '#fff' }}
                animationType="fade"
                transparent={true}
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
                            backgroundColor: '#333',
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
                                <Text
                                    style={{
                                        fontSize: 20,
                                        color: '#d8d5f1',
                                        fontWeight: 'bold',
                                    }}>
                                    Bedikah and Mikva Notifications{'\n'}
                                </Text>
                            </View>
                            <Button title="Close" />
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
                            <View
                                style={{
                                    width: '90%',
                                }}>
                                <Text
                                    style={{
                                        fontSize: 18,
                                        color: '#55a',
                                        fontWeight: 'bold',
                                    }}>
                                    Hefsek Tahara was done on {jdate.toString()}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: '#666',
                                    }}>
                                    {'\n\n'}
                                    If you would like to set Bedika
                                    notifications.
                                    {'\n\n'}
                                    PLEASE NOTE: your initial location has been
                                    set to "{this.props.locationName}".
                                    {'\n\n'}
                                    You can change this from the Settings screen
                                    as well.
                                    {'\n\n'}
                                    For a detailed explanation about how to use
                                    Luach, press on the "Help" button on the
                                    left.
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
                                                    textDecorationLine:
                                                        'underline',
                                                    fontWeight: 'bold',
                                                }}>
                                                DO NOT
                                            </Text>{' '}
                                            rely exclusivley upon this
                                            application for Halachic matters.
                                        </Text>
                                    </Text>
                                    {'\n\n\n'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
}
