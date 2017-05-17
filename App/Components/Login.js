import React from 'react';
import { Text, View, Image, Modal, TextInput } from 'react-native';

export default class Login extends React.Component {
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
        return <Modal animationType='fade' onRequestClose={() => false}>
            <View style={{ flex: 1, backgroundColor: '#444', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#eef', flex: 0, width: '75%', borderWidth: 1, borderRadius: 6, padding: 15, alignItems: 'center', marginTop: '10%' }}>
                    <Image style={{ width: 50, height: 50 }} resizeMode='stretch' source={require('../Images/logo.png')} />
                    <Text style={{ color: '#556', fontSize: 35, fontWeight: 'bold', paddingBottom: 20 }}>Luach</Text>
                    <Text>Please enter your 4 digit PIN</Text>
                    <TextInput
                        style={{ width: 150, fontSize: 20, textAlign: 'center' }}
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