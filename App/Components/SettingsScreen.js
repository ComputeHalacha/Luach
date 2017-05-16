import React, { Component } from 'react';
import { ScrollView, TouchableHighlight, View, Text, TextInput, Picker, Switch } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import SideMenu from './SideMenu';
import Location from '../Code/JCal/Location';
import { Icon } from 'react-native-elements';
import { setDefault } from '../Code/GeneralUtils';
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
            menuWidth: 50
        };
        this.update = this.update.bind(this);
        this.saveAndUpdate = this.saveAndUpdate.bind(this);
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
    }
    hideMenu() {
        this.setState({ menuWidth: 0 });
    }
    showMenu() {
        this.setState({ menuWidth: 50 });
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
    render() {
        const nums = Array.from({ length: 24 }, (v, i) => i + 1),
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
            requirePIN = setDefault(sets && sets.requirePIN, true),
            PIN = setDefault(sets && sets.PIN, '1234');

        return (
            <View style={GeneralStyles.container}>
                <GestureRecognizer style={{ flexDirection: 'row', flex: 1 }}
                    onSwipeLeft={this.hideMenu}
                    onSwipeRight={this.showMenu}>
                    <SideMenu
                        width={this.state.menuWidth}
                        onUpdate={this.onUpdate}
                        appData={this.state.appData}
                        navigate={this.navigate}
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
                            <Text style={GeneralStyles.label}>Flag Onah Beinunis (30 and 31) for a full 24 Hours?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('onahBeinunis24Hours', value)}
                                value={!!onahBeinunis24Hours} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Keep day Thirty One for Onah Beinunis?</Text>
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
                            <Text style={GeneralStyles.label}>Main Screen date navigation</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                                <Text>By Jewish Date</Text>
                                <Switch style={GeneralStyles.switch}
                                    onValueChange={value => this.update('navigateBySecularDate', value)}
                                    value={!!navigateBySecularDate} />
                                <Text>By Secular/Gregorian Date</Text>
                            </View>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Require PIN to open application?</Text>
                            <Switch style={GeneralStyles.switch}
                                onValueChange={value => this.update('requirePIN', value)}
                                value={!!requirePIN} />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>4 digit PIN Number</Text>
                            <TextInput style={GeneralStyles.textInput}
                                keyboardType='numeric'
                                returnKeyType='next'
                                maxLength={4}
                                onValueChange={value => this.update('PIN', value)}
                                value={PIN} />
                        </View>
                    </ScrollView>
                </GestureRecognizer>
            </View>);
    }
}