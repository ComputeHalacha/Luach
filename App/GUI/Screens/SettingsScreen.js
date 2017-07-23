import React, { Component } from 'react';
import { ScrollView, TouchableHighlight, View, KeyboardAvoidingView, Text, TextInput, Picker, Switch } from 'react-native';
import { Icon } from 'react-native-elements';
import SideMenu from '../Components/SideMenu';
import Location from '../../Code/JCal/Location';
import { setDefault, range } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class SettingsScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        const { appData, onUpdate } = navigation.state.params;
        return {
            title: 'Settings',
            headerRight:
            <TouchableHighlight
                onPress={() =>
                    navigation.navigate('Browser', {
                        appData,
                        onUpdate,
                        url: 'index.html',
                        title: 'Help'
                    })}>
                <View style={{ marginRight: 5 }}>
                    <Icon name='help'
                        color='#aac'
                        size={25} />
                    <Text>Luach Help</Text>
                </View>
            </TouchableHighlight>
        };
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
            location = sets && sets.location || Location.getLakewood(),
            showOhrZeruah = setDefault(sets && sets.showOhrZeruah, true),
            keepThirtyOne = setDefault(sets && sets.keepThirtyOne, true),
            onahBeinunis24Hours = sets && sets.onahBeinunis24Hours,
            numberMonthsAheadToWarn = (sets && sets.numberMonthsAheadToWarn) || 12,
            keepLongerHaflagah = setDefault(sets && sets.keepLongerHaflagah, true),
            cheshbonKavuahByCheshbon = setDefault(sets && sets.cheshbonKavuahByCheshbon, true),
            haflagaOfOnahs = sets && sets.haflagaOfOnahs,
            kavuahDiffOnahs = sets && sets.kavuahDiffOnahs,
            calcKavuahsOnNewEntry = setDefault(sets && sets.calcKavuahsOnNewEntry, true),
            showProbFlagOnHome = setDefault(sets && sets.showProbFlagOnHome, true),
            showEntryFlagOnHome = setDefault(sets && sets.showEntryFlagOnHome, true),
            navigateBySecularDate = sets && sets.navigateBySecularDate,
            showIgnoredKavuahs = sets && sets.showIgnoredKavuahs,
            noProbsAfterEntry = setDefault(sets && sets.noProbsAfterEntry, true),
            hideHelp = sets && sets.hideHelp,
            requirePIN = setDefault(sets && sets.requirePIN, true);

        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.onUpdate}
                        appData={this.state.appData}
                        navigator={this.props.navigation}
                        hideSettings={true}
                        helpUrl='Settings.html'
                        helpTitle='Settings' />
                    <ScrollView style={{ flex: 1 }}>
                        <View style={GeneralStyles.headerView}>
                            <Text style={GeneralStyles.headerText}>Halachic Settings</Text>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Choose your location</Text>
                            <TouchableHighlight underlayColor='#9f9' onPress={() =>
                                this.navigate('FindLocation', {
                                    onUpdate: this.saveAndUpdate,
                                    appData: this.state.appData
                                })}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name='edit-location' color='#484' size={35} />
                                    <Text>
                                        {location.Name}
                                    </Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Flag previous onah (The "Ohr Zaruah")</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('showOhrZeruah', value)}
                                value={!!showOhrZeruah} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Keep Onah Beinonis (30, 31 and Yom HaChodesh) for a full 24 Hours</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('onahBeinunis24Hours', value)}
                                value={!!onahBeinunis24Hours} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Keep day Thirty One for Onah Beinonis</Text>
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
                            <Text style={GeneralStyles.label}>Continue incrementing Dilug Yom Hachodesh Kavuahs into another month</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('cheshbonKavuahByCheshbon', value)}
                                value={!!cheshbonKavuahByCheshbon} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Calculate Haflagas by counting Onahs</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('haflagaOfOnahs', value)}
                                value={!!haflagaOfOnahs} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Flag Kavuahs even if not all the same Onah</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('kavuahDiffOnahs', value)}
                                value={!!kavuahDiffOnahs} />
                        </View>
                        <View style={GeneralStyles.headerView}>
                            <Text style={GeneralStyles.headerText}>Application Settings</Text>
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
                            <Text style={GeneralStyles.label}>Automatically Calculate Kavuahs upon addition of an Entry</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('calcKavuahsOnNewEntry', value)}
                                value={!!calcKavuahsOnNewEntry} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Show Entry, Hefsek Tahara and Mikva information?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('showEntryFlagOnHome', value)}
                                value={!!showEntryFlagOnHome} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Show flags for problem dates on Main Screen?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('showProbFlagOnHome', value)}
                                value={!!showProbFlagOnHome} />
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
                            {navigateBySecularDate &&
                                <Text style={{ fontSize: 11, color: '#b55', paddingLeft: 10, paddingBottom: 5 }}>
                                    Please Note: If the current time is between sunset and midnight, the current Jewish date will be incorrect.
                                </Text>
                            }
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Show explicitly ignored Kavuahs in the Kavuah list</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('showIgnoredKavuahs', value)}
                                value={!!showIgnoredKavuahs} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Don't show Flagged dates for a week after Entry</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('noProbsAfterEntry', value)}
                                value={!!noProbsAfterEntry} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Hide Help Button</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('hideHelp', value)}
                                value={!!hideHelp} />
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