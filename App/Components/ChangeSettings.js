import React, { Component } from 'react';
import { ScrollView, View, StyleSheet, Text, Picker, Switch } from 'react-native';
import Location from '../Code/JCal/Location';
import { setDefault } from '../Code/GeneralUtils';

export default class ChangeSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: {},
            locations: []
        };
    }
    update(name, value) {
        const sets = this.state.settings;
        sets[name] = value;
        this.setState({ settings: sets });
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
            <ScrollView style={styles.container}>
                <Text style={styles.header}>Settings</Text>
                <View style={styles.formRow}>
                    <Text style={styles.label}>Choose your location</Text>
                    <Picker style={styles.picker}
                        selectedValue={location}
                        onValueChange={value => me.update('location', value)}>
                        {locations.map(n => {
                            return (<Picker.Item label={n.Name} value={n} key={n.Name} />);
                        })}
                    </Picker>
                </View>
                <View style={styles.formRow}>
                    <Text style={styles.label}>Number of Months ahead to warn</Text>
                    <Picker style={styles.picker}
                        selectedValue={numberMonthsAheadToWarn}
                        onValueChange={value => me.update('numberMonthsAheadToWarn', value)}>
                        {nums.map((n, i) => {
                            return (<Picker.Item label={n.toString()} value={n} key={i} />);
                        })}
                    </Picker>
                </View>
                <View style={styles.formRow}>
                    <Text style={styles.label}>Flag previous onah? (The "Ohr Zaruah")</Text>
                    <Switch style={styles.switch}
                        onValueChange={value => me.update('showOhrZeruah', value)}
                        value={!!showOhrZeruah} />
                </View>
                <View style={styles.formRow}>
                    <Text style={styles.label}>Flag Onah Beinunis (30 & 31) for a full 24 Hours?</Text>
                    <Switch style={styles.switch}
                        onValueChange={value => me.update('onahBeinunis24Hours', value)}
                        value={!!onahBeinunis24Hours} />
                </View>
                <View style={styles.formRow}>
                    <Text style={styles.label}>Haflaga is only cancelled by a longer one</Text>
                    <Switch style={styles.switch}
                        onValueChange={value => me.update('keepLongerHaflagah', value)}
                        value={!!keepLongerHaflagah} />
                </View>
                <View style={styles.formRow}>
                    <Text style={styles.label}>Calculate Haflaga Kavuahs from an actual entry?</Text>
                    <Switch style={styles.switch}
                        onValueChange={value => me.update('cheshbonKavuahByActualEntry', value)}
                        value={!!cheshbonKavuahByActualEntry} />
                </View>
                <View style={styles.formRow}>
                    <Text style={styles.label}>Calculate Haflaga Kavuahs from the proceeding haflaga date even without an actual entry?</Text>
                    <Switch style={styles.switch}
                        onValueChange={value => me.update('cheshbonKavuahByCheshbon', value)}
                        value={!!cheshbonKavuahByCheshbon} />
                </View>
            </ScrollView>);
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: {
        backgroundColor: '#fe9', color: '#977', padding: 5, flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 14
    },
    formRow: { flex: 1, flexDirection: 'column' },
    label: { margin: 0, backgroundColor: '#f5f5e8', padding: 10 },
    picker: { margin: 0 },
    switch: { margin: 5, alignSelf: 'flex-start' }
});