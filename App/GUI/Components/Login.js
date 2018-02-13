import React from 'react';
import { Text, View, Image, Modal, TextInput } from 'react-native';
import { GLOBALS } from '../../Code/GeneralUtils';

export default class Login extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = { incorrectPin: false, enteredPIN: '' };

        this.loginAttempt = this.loginAttempt.bind(this);
    }
    loginAttempt(pin) {
        if (pin.length === 4) {
            if (pin === this.props.pin) {
                this.props.onLoggedIn();
            }
            else {
                this.setState({
                    incorrectPin: true,
                    enteredPIN: ''
                });
            }
        }
        else {
            this.setState({
                incorrectPin: false,
                enteredPIN: pin
            });
        }
    }
    render() {
        return <Modal onRequestClose={() => false}>
            <View style={{ flex: 1, backgroundColor: '#444', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#eef', flex: 0, width: '75%', borderWidth: 1, borderRadius: 6, padding: 15, alignItems: 'center', marginTop: '10%' }}>
                    <Image style={{ width: 50, height: 50 }} resizeMode='stretch' source={require('../Images/logo.png')} />
                    <Text style={{ color: '#556', fontSize: 35, fontWeight: 'bold', paddingBottom: 10 }}>Luach</Text>
                    <Text style={{ color: '#888', fontSize: 11, paddingBottom: 10 }}>{`Version ${GLOBALS.VERSION_NAME}`}</Text>
                    <Text>Please enter your 4 digit PIN</Text>
                    <TextInput
                        style={{ width: 150, height: 75, fontSize: 25, textAlign: 'center' }}
                        keyboardType='numeric'
                        returnKeyType='next'
                        maxLength={4}
                        autoFocus={true}
                        secureTextEntry={true}
                        iosclearTextOnFocus={true}
                        value={this.state.enteredPIN}
                        onChangeText={value => this.loginAttempt(value)} />
                    <View style={{ alignItems: 'center', display: this.state.incorrectPin ? 'flex' : 'none' }}>
                        <Text style={{ color: '#833', fontSize: 12 }}>Incorrect PIN</Text>
                    </View>
                </View>
            </View>
        </Modal>;
    }
}