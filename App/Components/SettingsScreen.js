import React, { Component } from 'react';
import { ScrollView, View, StyleSheet, Text, Picker, Switch, Alert } from 'react-native';
import Location from '../Code/JCal/Location';
import { setDefault } from '../Code/GeneralUtils';
import {GeneralStyles} from './styles';

export default class SettingsScreen extends Component {
    static navigationOptions = {
        title: 'Settings',
    };
    constructor(props) {
        super(props);
        const { appData, onUpdate } = this.props.navigation.state.params;
        this.onUpdate = onUpdate;
        this.state = {
            settings: appData.Settings || {},
            locations: appData.Locations || []
        };
    }
    update(name, value) {
        const sets = this.state.settings;
        sets[name] = value;
        sets.save();
        this.setState({ settings: sets });
        this.onUpdate(sets);
    }
    render() {
        const nums = [];
        for (let i = 1; i < 24; i++) {
            nums.push(i);
        }

        const me = this,
            location = this.state.settings.location || Location.getJerusalem(),
            locations = this.state.locations || [],
            showOhrZeruah = setDefault(this.state.settings && this.state.settings.showOhrZeruah, true),
            onahBeinunis24Hours = this.state.settings && this.state.settings.onahBeinunis24Hours,
            numberMonthsAheadToWarn = (this.state.settings && this.state.settings.numberMonthsAheadToWarn) || 12,
            keepLongerHaflagah = setDefault(this.state.settings && this.state.settings.keepLongerHaflagah, true),
            cheshbonKavuahByActualEntry = setDefault(this.state.settings && this.state.settings.cheshbonKavuahByActualEntry, true),
            cheshbonKavuahByCheshbon = setDefault(this.state.settings && this.state.settings.cheshbonKavuahByCheshbon, true);
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
            </ScrollView>);
    }
}