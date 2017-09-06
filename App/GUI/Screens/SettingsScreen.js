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
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <TouchableHighlight
                    onPress={() =>
                        navigation.navigate('ExportData', { appData, dataSet: 'Settings' })}>
                    <View style={{ marginRight: 10 }}>
                        <Icon name='import-export'
                            color='#aca'
                            size={25} />
                        <Text style={{ fontSize: 10, color: '#797' }}>Export Data</Text>
                    </View>
                </TouchableHighlight>
                <TouchableHighlight
                    onPress={() =>
                        navigation.navigate('Browser', {
                            appData,
                            onUpdate,
                            url: 'index.html',
                            title: 'Help'
                        })}>
                    <View style={{ marginRight: 3 }}>
                        <Icon name='help'
                            color='#aac'
                            size={25} />
                        <Text style={{ fontSize: 10, color: '#aac' }}>Luach Help</Text>
                    </View>
                </TouchableHighlight>
            </View>
        };
    };
    constructor(props) {
        super(props);
        this.navigate = this.props.navigation.navigate;
        const { appData, onUpdate } = this.props.navigation.state.params;
        this.appData = appData;
        this.update = ad => {
            ad = ad || this.appData;
            this.setState({ settings: ad.Settings });
            if (onUpdate) {
                onUpdate(ad);
            }
        };
        this.state = {
            settings: appData.Settings,
            //The enteredPin is instead of settings.PIN in case the entered PIN is invalid.
            //We still want to display it, but not to change the setting.
            enteredPin: appData.Settings.PIN
        };
        this.changeSetting = this.changeSetting.bind(this);
        this.changePIN = this.changePIN.bind(this);
    }
    changeSetting(name, value) {
        const settings = this.state.settings;
        settings[name] = value;
        settings.save();
        this.update();
    }
    changePIN(pin) {
        const validPin = /^\d{4}$/.test(pin);
        if (validPin) {
            this.changeSetting('PIN', pin);
        }
        this.setState({ invalidPin: !validPin, enteredPin: pin });
    }
    render() {
        const nums = range(1, 24),
            settings = this.state.settings,
            location = settings.location || Location.getLakewood(),
            showOhrZeruah = setDefault(settings.showOhrZeruah, true),
            keepThirtyOne = setDefault(settings.keepThirtyOne, true),
            onahBeinunis24Hours = settings.onahBeinunis24Hours,
            numberMonthsAheadToWarn = (settings.numberMonthsAheadToWarn) || 12,
            keepLongerHaflagah = setDefault(settings.keepLongerHaflagah, true),
            cheshbonKavuahByCheshbon = setDefault(settings.cheshbonKavuahByCheshbon, true),
            haflagaOfOnahs = settings.haflagaOfOnahs,
            kavuahDiffOnahs = settings.kavuahDiffOnahs,
            calcKavuahsOnNewEntry = setDefault(settings.calcKavuahsOnNewEntry, true),
            showProbFlagOnHome = setDefault(settings.showProbFlagOnHome, true),
            showEntryFlagOnHome = setDefault(settings.showEntryFlagOnHome, true),
            navigateBySecularDate = settings.navigateBySecularDate,
            showIgnoredKavuahs = settings.showIgnoredKavuahs,
            noProbsAfterEntry = setDefault(settings.noProbsAfterEntry, true),
            hideHelp = settings.hideHelp,
            requirePIN = setDefault(settings.requirePIN, true);

        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.update}
                        appData={this.appData}
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
                                    onUpdate: this.update,
                                    appData: this.appData
                                })}>
                                <View style={GeneralStyles.centeredRow}>
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
                                onValueChange={value => this.changeSetting('showOhrZeruah', value)}
                                value={!!showOhrZeruah} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Keep Onah Beinonis (30, 31 and Yom HaChodesh) for a full 24 Hours</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.changeSetting('onahBeinunis24Hours', value)}
                                value={!!onahBeinunis24Hours} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Keep day Thirty One for Onah Beinonis</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.changeSetting('keepThirtyOne', value)}
                                value={!!keepThirtyOne} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Haflaga is only cancelled by a longer one</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.changeSetting('keepLongerHaflagah', value)}
                                value={!!keepLongerHaflagah} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Continue incrementing Dilug Yom Hachodesh Kavuahs into another month</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.changeSetting('cheshbonKavuahByCheshbon', value)}
                                value={!!cheshbonKavuahByCheshbon} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Calculate Haflagas by counting Onahs</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.changeSetting('haflagaOfOnahs', value)}
                                value={!!haflagaOfOnahs} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Flag Kavuahs even if not all the same Onah</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.changeSetting('kavuahDiffOnahs', value)}
                                value={!!kavuahDiffOnahs} />
                        </View>
                        <View style={GeneralStyles.headerView}>
                            <Text style={GeneralStyles.headerText}>Application Settings</Text>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Number of Months ahead to warn</Text>
                            <Picker style={GeneralStyles.picker}
                                selectedValue={numberMonthsAheadToWarn}
                                onValueChange={value => this.changeSetting('numberMonthsAheadToWarn', value)}>
                                {nums.map((n, i) => {
                                    return (<Picker.Item label={n.toString()} value={n} key={i} />);
                                })}
                            </Picker>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Automatically Calculate Kavuahs upon addition of an Entry</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.changeSetting('calcKavuahsOnNewEntry', value)}
                                value={!!calcKavuahsOnNewEntry} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Show Entry, Hefsek Tahara and Mikva information?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.changeSetting('showEntryFlagOnHome', value)}
                                value={!!showEntryFlagOnHome} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Show flags for problem dates on Main Screen?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.changeSetting('showProbFlagOnHome', value)}
                                value={!!showProbFlagOnHome} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Calendar displays current:</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                                <Text>Jewish Date</Text>
                                <Switch style={GeneralStyles.switch}
                                    onValueChange={value => this.changeSetting('navigateBySecularDate', value)}
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
                                onValueChange={value => this.changeSetting('showIgnoredKavuahs', value)}
                                value={!!showIgnoredKavuahs} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Don't show Flagged dates for a week after Entry</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.changeSetting('noProbsAfterEntry', value)}
                                value={!!noProbsAfterEntry} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Hide Help Button</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.changeSetting('hideHelp', value)}
                                value={!!hideHelp} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Require PIN to open application?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.changeSetting('requirePIN', value)}
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