import React from 'react';
import { Text, View, Image, Modal, TextInput } from 'react-native';
import { GLOBALS } from '../../Code/GeneralUtils';

export default class Login extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { incorrectPin: false, enteredPIN: '' };

        if (!props.pin) {
            props.onLoggedIn();
        } else {
            this.loginTextChange = this.loginTextChange.bind(this);
            this.loginAttempt = this.loginAttempt.bind(this);
        }
    }

    loginTextChange(val) {
        this.setState({ enteredPIN: val });
        if (GLOBALS.VALID_PIN.test(val)) {
            if (val === this.props.pin) {
                this.props.onLoggedIn();
            }
        }
    }

    loginAttempt(pin) {
        if (GLOBALS.VALID_PIN.test(pin)) {
            if (pin === this.props.pin) {
                this.props.onLoggedIn();
            } else {
                this.setState({
                    incorrectPin: true,
                });
            }
        } else {
            this.setState({
                incorrectPin: false,
            });
        }
    }
    render() {
        return (
            <Modal onRequestClose={() => false}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: '#444',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            backgroundColor: '#eef',
                            flex: 0,
                            width: '75%',
                            borderWidth: 1,
                            borderRadius: 6,
                            padding: 15,
                            alignItems: 'center',
                            marginTop: '10%',
                        }}>
                        <Image
                            style={{ width: 50, height: 50 }}
                            resizeMode="stretch"
                            source={require('../Images/logo.png')}
                        />
                        <Text
                            style={{
                                color: '#556',
                                fontSize: 35,
                                fontWeight: 'bold',
                                paddingBottom: 10,
                            }}>
                            Luach
                        </Text>
                        <Text
                            style={{
                                color: '#888',
                                fontSize: 11,
                                paddingBottom: 10,
                            }}>{`Version ${GLOBALS.VERSION_NAME}`}</Text>
                        <Text>Please enter your PIN</Text>
                        <TextInput
                            style={{
                                width: 150,
                                height: 75,
                                fontSize: 25,
                                textAlign: 'center',
                                alignSelf: 'center',
                            }}
                            keyboardType="numeric"
                            returnKeyType="next"
                            autoFocus={true}
                            secureTextEntry={true}
                            iosclearTextOnFocus={true}
                            value={this.state.enteredPIN}
                            onChangeText={(val) => this.loginTextChange(val)}
                            onSubmitEditing={(event) =>
                                this.loginAttempt(event.nativeEvent.text)
                            }
                        />
                        <View
                            style={{
                                alignItems: 'center',
                                display: this.state.incorrectPin
                                    ? 'flex'
                                    : 'none',
                            }}>
                            <Text style={{ color: '#833', fontSize: 12 }}>
                                Incorrect PIN
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}
