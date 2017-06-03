import React, { Component } from 'react';
import { ScrollView, TouchableHighlight, View, KeyboardAvoidingView, Text, TextInput, Picker, Switch } from 'react-native';
import SideMenu from './SideMenu';
import Location from '../Code/JCal/Location';
import { Icon } from 'react-native-elements';
import { setDefault, range } from '../Code/GeneralUtils';
import { GeneralStyles } from './styles';

export default class SettingsScreen extends Component {
    static navigationOptions = {
        title: 'Settings',
    };
    constructor(props) {
        super(props);
        this.navigate = this.props.navigation.navigate;
        const { appData, onUpdate } = this.props.navigation.state.params;
        this.onUpdate = onUpdate;
        this.state = {
            appData: appData,
            enteredPin: appData.Settings.PIN
        };
        this.update = this.update.bind(this);
        this.saveAndUpdate = this.saveAndUpdate.bind(this);
        this.changePIN = this.changePIN.bind(this);
    }
    saveAndUpdate(appData) {
        appData.Settings.save();
        this.setState({ appData: appData });
        if (this.onUpdate) {
            this.onUpdate(appData);
        }
    }
    update(name, value) {
        const appData = this.state.appData,
            sets = appData.Settings;
        sets[name] = value;
        this.saveAndUpdate(appData);
    }
    changePIN(pin) {
        const validPin = /^\d{4}$/.test(pin);
        if (validPin) {
            const appData = this.state.appData;
            appData.Settings.PIN = pin;
            this.saveAndUpdate(appData);
        }
        this.setState({ invalidPin: !validPin, enteredPin: pin });
    }
    render() {
        const nums = range(1, 24),
            sets = this.state.appData && this.state.appData.Settings,
            location = sets && sets.location || Location.getJerusalem(),
            showOhrZeruah = setDefault(sets && sets.showOhrZeruah, true),
            keepThirtyOne = setDefault(sets && sets.keepThirtyOne, true),
            onahBeinunis24Hours = sets && sets.onahBeinunis24Hours,
            numberMonthsAheadToWarn = (sets && sets.numberMonthsAheadToWarn) || 12,
            keepLongerHaflagah = setDefault(sets && sets.keepLongerHaflagah, true),
            cheshbonKavuahByActualEntry = setDefault(sets && sets.cheshbonKavuahByActualEntry, true),
            cheshbonKavuahByCheshbon = setDefault(sets && sets.cheshbonKavuahByCheshbon, true),
            calcKavuahsOnNewEntry = setDefault(sets && sets.calcKavuahsOnNewEntry, true),
            showProbFlagOnHome = setDefault(sets && sets.showProbFlagOnHome, true),
            showEntryFlagOnHome = setDefault(sets && sets.showEntryFlagOnHome, true),
            navigateBySecularDate = sets && sets.navigateBySecularDate,
            showIgnoredKavuahs = sets && sets.showIgnoredKavuahs,
            requirePIN = setDefault(sets && sets.requirePIN, true);

        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.onUpdate}
                        appData={this.state.appData}
                        navigator={this.props.navigation}
                        hideSettings={true}
                        hideMonthView={true} />
                    <ScrollView style={{ flex: 1 }}>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Choose your location</Text>
                            <TouchableHighlight underlayColor='#9f9' onPress={() =>
                                this.navigate('FindLocation', {
                                    onUpdate: this.saveAndUpdate,
                                    appData: this.state.appData
                                })}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Icon name='edit-location' color='#484' size={35} />
                                    <Text style={GeneralStyles.textInput}>
                                        {location.Name}
                                    </Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Number of Months ahead to warn</Text>
                            <Picker style={GeneralStyles.picker}
                                selectedValue={numberMonthsAheadToWarn}
                                onValueChange={value => this.update('numberMonthsAheadToWarn', value)}>
                                {nums.map((n, i) => {
                                    return (<Picker.Item label={n.toString()} value={n} key={i} />);
                                })}
                            </Picker>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Flag previous onah? (The "Ohr Zaruah")</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('showOhrZeruah', value)}
                                value={!!showOhrZeruah} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Keep Onah Beinonis (30, 31 and Yom HaChodesh) for a full 24 Hours?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('onahBeinunis24Hours', value)}
                                value={!!onahBeinunis24Hours} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Keep day Thirty One for Onah Beinonis?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('keepThirtyOne', value)}
                                value={!!keepThirtyOne} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Haflaga is only cancelled by a longer one</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('keepLongerHaflagah', value)}
                                value={!!keepLongerHaflagah} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Calculate Haflaga Kavuahs from an actual entry?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('cheshbonKavuahByActualEntry', value)}
                                value={!!cheshbonKavuahByActualEntry} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Calculate Haflaga Kavuahs from the proceeding haflaga date even without an actual entry?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('cheshbonKavuahByCheshbon', value)}
                                value={!!cheshbonKavuahByCheshbon} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Automatically Calculate Kavuahs upon addition of an Entry?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('calcKavuahsOnNewEntry', value)}
                                value={!!calcKavuahsOnNewEntry} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Show flags for problem dates on Main Screen?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('showProbFlagOnHome', value)}
                                value={!!showProbFlagOnHome} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Show flags for dates that have an Entry on Main Screen?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('showEntryFlagOnHome', value)}
                                value={!!showEntryFlagOnHome} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Calendar displays current:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                                <Text>Jewish Date</Text>
                                <Switch style={GeneralStyles.switch}
                                    onValueChange={value => this.update('navigateBySecularDate', value)}
                                    value={!!navigateBySecularDate} />
                                <Text>Secular Date</Text>
                            </View>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Show explicitly ignored Kavuahs in the Kavuah list?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('showIgnoredKavuahs', value)}
                                value={!!showIgnoredKavuahs} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Require PIN to open application?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('requirePIN', value)}
                                value={!!requirePIN} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>4 digit PIN Number</Text>
                            <KeyboardAvoidingView
                                style={{
                                    display: this.state.invalidPin ? 'flex' : 'none',
                                    marginTop: 5,
                                    marginLeft: 10
                                }}>
                                <Text style={{ color: '#f55', fontSize: 12, fontWeight: 'bold' }}>PIN must have 4 digits</Text>
                            </KeyboardAvoidingView>
                            <TextInput style={GeneralStyles.textInput}
                                keyboardType='numeric'
                                returnKeyType='next'
                                maxLength={4}
                                onChangeText={value => {
                                    this.changePIN(value);
                                }}
                                value={this.state.enteredPin} />
                        </View>
                    </ScrollView>
                </View>
            </View >);
    }
}