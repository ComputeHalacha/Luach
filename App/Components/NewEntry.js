import React, { Component } from 'react';
import { ScrollView, View, StyleSheet, Text, Button, Picker } from 'react-native';
import Entry from '../Code/Chashavshavon/Entry';
import NightDay from '../Code/Chashavshavon/NightDay';
import JDate from '../Code/JCal/jDate';
import Utils from '../Code/JCal/Utils';
import Location from '../Code/JCal/Location';
import Onah from '../Code/Chashavshavon/Onah';
import DataUtils from '../Code/Data/DataUtils';

export default class NewEntry extends React.Component {
    constructor(props) {
        super(props);

        const dt = new Date(),
            jd = new JDate(dt),
            shkia = jd.getSunriseSunset(this.props.location || Location.getJerusalem()).sunset(),
            currTime = { hour: dt.getHours(), minute: dt.getMinutes() },
            isNight = Utils.totalMinutes(Utils.timeDiff(currTime, shkia)) >= 0;

        this.day = jd.Day;
        this.month = jd.Month;
        this.year = jd.Year;
        this.nightDay = isNight ? NightDay.Night : NightDay.Day;
    }
    addEntry() {
        const jdate = new JDate(this.year, this.month, this.day),
            onah = new Onah(jdate, this.nightDay),
            entry = new Entry(onah);
        DataUtils.EntryToDatabase(entry).then(() =>
            this.props.afterAdd(entry)
        ).catch(error => {
            console.warn('Error trying to add entry to the database.');
            console.error(error);
        });
    }
    render() {
        const lastYear = this.year - 1,
            twoYearsBack = lastYear - 1,
            daysOfMonth = [];
        for (let i = 1; i < 31; i++) {
            daysOfMonth.push(i);
        }
        return <ScrollView style={styles.container}>
            <Text style={styles.header}>New Entry</Text>
            <View style={styles.formRow}>
                <Text style={styles.label}>Day</Text>
                <Picker style={styles.picker}
                    selectedValue={this.day}
                    onValueChange={value => this.day = value}>
                    {daysOfMonth.map(d =>
                        <Picker.Item label={d.toString()} value={d} key={d} />
                    )}
                </Picker>
            </View>
            <View style={styles.formRow}>
                <Text style={styles.label}>Month</Text>
                <Picker style={styles.picker}
                    selectedValue={this.month}
                    onValueChange={value => this.month = value}>
                    {Utils.jMonthsEng.map((m, i) =>
                        <Picker.Item label={m || 'Choose a Month'} value={i} key={i} />
                    )}
                </Picker>
            </View>
            <View style={styles.formRow}>
                <Text style={styles.label}>Year</Text>
                <Picker style={styles.picker}
                    selectedValue={this.year}
                    onValueChange={value => this.year = value}>
                    <Picker.Item label={this.year.toString()} value={this.year} key={this.year} />
                    <Picker.Item label={lastYear.toString()} value={lastYear} key={lastYear} />
                    <Picker.Item label={twoYearsBack.toString()} value={twoYearsBack} key={twoYearsBack} />
                </Picker>
            </View>
            <View style={styles.formRow}>
                <Text style={styles.label}>Time of Day</Text>
                <Picker style={styles.picker}
                    selectedValue={this.nightDay}
                    onValueChange={value => this.nightDay = value}>
                    <Picker.Item label='Night' value={NightDay.Night} key={NightDay.Night} />
                    <Picker.Item label='Day' value={NightDay.Day} key={NightDay.Day} />
                </Picker>
            </View>
            <Text>{'\n'}</Text>
            <View style={styles.formRow}>
                <Button title='Add Entry' onPress={this.addEntry} />
            </View>
        </ScrollView>;
    }
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: {
        backgroundColor: '#fe9', color: '#977', padding: 5, flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 14
    },
    formRow: { flex: 1, flexDirection: 'column' },
    label: { margin: 0, backgroundColor: '#f5f5e8', padding: 10 },
    picker: { margin: 0 }
});