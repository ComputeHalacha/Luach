import React from 'react';
import { ScrollView, View, Text, Picker, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import Entry from '../Code/Chashavshavon/Entry';
import Utils from '../Code/JCal/Utils';
import Location from '../Code/JCal/Location';
import {NightDay, Onah} from '../Code/Chashavshavon/Onah';
import DataUtils from '../Code/Data/DataUtils';
import {GeneralStyles} from './styles';

export default class NewEntry extends React.Component {
    static navigationOptions = {
        title: 'New Entry'
    };

    constructor(props) {
        super(props);
        const navigation = this.props.navigation,
            { jdate, location, appData } = navigation.state.params,
            dt = new Date(),
            shkia = jdate.getSunriseSunset(location || Location.getJerusalem()).sunset,
            currTime = { hour: dt.getHours(), minute: dt.getMinutes() },
            isNight = Utils.totalMinutes(Utils.timeDiff(currTime, shkia)) >= 0;

        this.state = { appData: appData };
        this.jdate = jdate,
            this.location = location;
        this.nightDay = isNight ? NightDay.Night : NightDay.Day;
        this.navigate = navigation.navigate;
    }
    addEntry() {
        const onah = new Onah(this.jdate, this.nightDay),
            entry = new Entry(onah);
        DataUtils.EntryToDatabase(entry).then(() => {
            const appData = this.state.appData,
                entryList = appData.EntryList;
            entryList.add(entry);
            entryList.calulateHaflagas();
            this.setState({ appData: appData });
            Alert.alert('Add Entry',
                        `The entry for ${entry.toString()} has been successfully added.`);
            this.navigate('Entries', { appData: this.state.appData });
        }
        ).catch(error => {
            console.warn('Error trying to add entry to the database.');
            console.error(error);
        });
    }
    render() {
        const lastYear = this.jdate.Year - 1,
            twoYearsBack = lastYear - 1,
            daysOfMonth = [];
        for (let i = 1; i < 31; i++) {
            daysOfMonth.push(i);
        }
        return <ScrollView style={GeneralStyles.container}>
            <Text style={GeneralStyles.header}>New Entry</Text>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Day</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={this.jdate.Day}
                    onValueChange={value => this.jdate.Day = value}>
                    {daysOfMonth.map(d =>
                        <Picker.Item label={d.toString()} value={d} key={d} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Month</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={this.jdate.Month}
                    onValueChange={value => this.jdate.Month = value}>
                    {Utils.jMonthsEng.map((m, i) =>
                        <Picker.Item label={m || 'Choose a Month'} value={i} key={i} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Year</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={this.jdate.Year}
                    onValueChange={value => this.jdate.Year = value}>
                    <Picker.Item label={this.jdate.Year.toString()} value={this.jdate.Year} key={this.jdate.Year} />
                    <Picker.Item label={lastYear.toString()} value={lastYear} key={lastYear} />
                    <Picker.Item label={twoYearsBack.toString()} value={twoYearsBack} key={twoYearsBack} />
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Time of Day</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={this.nightDay}
                    onValueChange={value => this.nightDay = value}>
                    <Picker.Item label='Night' value={NightDay.Night} key={NightDay.Night} />
                    <Picker.Item label='Day' value={NightDay.Day} key={NightDay.Day} />
                </Picker>
            </View>
            <Text>{'\n'}</Text>
            <View style={GeneralStyles.formRow}>
                <Button title='Add Entry' onPress={this.addEntry.bind(this)} />
            </View>
        </ScrollView>;
    }
}