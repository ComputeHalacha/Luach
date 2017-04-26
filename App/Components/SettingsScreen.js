import React, { Component } from 'react';
import { ScrollView, View, Text, TextInput, Picker, Switch } from 'react-native';
import Location from '../Code/JCal/Location';
import { setDefault } from '../Code/GeneralUtils';
import { GeneralStyles } from './styles';

export default class SettingsScreen extends Component {
    static navigationOptions = {
        title: 'Settings',
    };
    constructor(props) {
        super(props);
        const { appData, onUpdate } = this.props.navigation.state.params;
        this.onUpdate = onUpdate;
        this.state = {
            appData: appData
        };
    }
    update(name, value) {
        const appData = this.state.appData,
            sets = appData.Settings;
        sets[name] = value;
        sets.save();
        this.setState({ appData: appData });
        this.onUpdate(appData);
    }
    render() {
        const nums = [];
        for (let i = 1; i < 24; i++) {
            nums.push(i);
        }

        const me = this,
            sets = this.state.appData && this.state.appData.Settings,
            location = sets && sets.location || Location.getJerusalem(),
            locations = this.state.appData && this.state.appData.Locations || [],
            showOhrZeruah = setDefault(sets && sets.showOhrZeruah, true),
            onahBeinunis24Hours = sets && sets.onahBeinunis24Hours,
            numberMonthsAheadToWarn = (sets && sets.numberMonthsAheadToWarn) || 12,
            keepLongerHaflagah = setDefault(sets && sets.keepLongerHaflagah, true),
            cheshbonKavuahByActualEntry = setDefault(sets && sets.cheshbonKavuahByActualEntry, true),
            cheshbonKavuahByCheshbon = setDefault(sets && sets.cheshbonKavuahByCheshbon, true),
            calcKavuahsOnNewEntry = setDefault(sets && sets.calcKavuahsOnNewEntry, true),
            showProbFlagOnHome = setDefault(sets && sets.showProbFlagOnHome, true),
            showEntryFlagOnHome = setDefault(sets && sets.showEntryFlagOnHome, true),
            requirePIN = setDefault(sets && sets.requirePIN, true),
            PIN = setDefault(sets && sets.PIN, '1234');
        me.update.bind(me);
        return (
            <ScrollView style={GeneralStyles.container}>
                <Text style={GeneralStyles.header}>Settings</Text>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>Choose your location</Text>
                    <Picker style={GeneralStyles.picker}
                        selectedValue={location}
                        onValueChange={value => me.update('location', value)}>
                        {locations.map(n => {
                            return (<Picker.Item label={n.Name} value={n} key={n.Name} />);
                        })}
                    </Picker>
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>Number of Months ahead to warn</Text>
                    <Picker style={GeneralStyles.picker}
                        selectedValue={numberMonthsAheadToWarn}
                        onValueChange={value => me.update('numberMonthsAheadToWarn', value)}>
                        {nums.map((n, i) => {
                            return (<Picker.Item label={n.toString()} value={n} key={i} />);
                        })}
                    </Picker>
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>Flag previous onah? (The "Ohr Zaruah")</Text>
                    <Switch style={GeneralStyles.switch}
                        onValueChange={value => me.update('showOhrZeruah', value)}
                        value={!!showOhrZeruah} />
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>Flag Onah Beinunis (30 & 31) for a full 24 Hours?</Text>
                    <Switch style={GeneralStyles.switch}
                        onValueChange={value => me.update('onahBeinunis24Hours', value)}
                        value={!!onahBeinunis24Hours} />
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>Haflaga is only cancelled by a longer one</Text>
                    <Switch style={GeneralStyles.switch}
                        onValueChange={value => me.update('keepLongerHaflagah', value)}
                        value={!!keepLongerHaflagah} />
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>Calculate Haflaga Kavuahs from an actual entry?</Text>
                    <Switch style={GeneralStyles.switch}
                        onValueChange={value => me.update('cheshbonKavuahByActualEntry', value)}
                        value={!!cheshbonKavuahByActualEntry} />
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>Calculate Haflaga Kavuahs from the proceeding haflaga date even without an actual entry?</Text>
                    <Switch style={GeneralStyles.switch}
                        onValueChange={value => me.update('cheshbonKavuahByCheshbon', value)}
                        value={!!cheshbonKavuahByCheshbon} />
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>Automatically Calculate Kavuahs upon addition of an Entry?</Text>
                    <Switch style={GeneralStyles.switch}
                        onValueChange={value => me.update('calcKavuahsOnNewEntry', value)}
                        value={!!calcKavuahsOnNewEntry} />
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>Show flags for problem dates on home page?</Text>
                    <Switch style={GeneralStyles.switch}
                        onValueChange={value => me.update('showProbFlagOnHome', value)}
                        value={!!showProbFlagOnHome} />
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>Show flags for dates that have an Entry on home page?</Text>
                    <Switch style={GeneralStyles.switch}
                        onValueChange={value => me.update('showEntryFlagOnHome', value)}
                        value={!!showEntryFlagOnHome} />
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>Require PIN to open application?</Text>
                    <Switch style={GeneralStyles.switch}
                        onValueChange={value => me.update('requirePIN', value)}
                        value={!!requirePIN} />
                </View>
                <View style={GeneralStyles.formRow}>
                    <Text style={GeneralStyles.label}>4 digit PIN Number</Text>
                    <TextInput style={GeneralStyles.textInput}
                        keyboardType='numeric'
                        returnKeyType='next'
                        maxLength={4}
                        onValueChange={value => me.update('PIN', value)}
                        value={PIN} />
                </View>
            </ScrollView>);
    }
}