import React from 'react';
import { ScrollView, View, Text, Picker, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import Entry from '../Code/Chashavshavon/Entry';
import { Kavuah } from '../Code/Chashavshavon/Kavuah';
import Utils from '../Code/JCal/Utils';
import jDate from '../Code/JCal/jDate';
import { NightDay, Onah } from '../Code/Chashavshavon/Onah';
import DataUtils from '../Code/Data/DataUtils';
import { popUpMessage } from '../Code/GeneralUtils';
import { GeneralStyles } from './styles';

export default class NewEntry extends React.Component {
    static navigationOptions = {
        title: 'New Entry'
    };

    constructor(props) {
        super(props);
        const navigation = this.props.navigation,
            { jdate, location, isToday, appData, onUpdate } = navigation.state.params,
            sunset = jdate.getSunriseSunset(location).sunset,
            sunsetMs = Utils.totalMinutes(sunset) * 60000,
            isNight = (sunsetMs <= new Date().getTime());
        if (isToday && isNight) {
            this.showWarning = true;
        }
        this.onUpdate = onUpdate;

        this.state = {
            appData: appData,
            jdate: jdate,
            nightDay: isNight ? NightDay.Night : NightDay.Day
        };
        this.location = location;

        this.navigate = navigation.navigate;
        this.dispatch = navigation.dispatch;
    }
    addEntry() {
        const appData = this.state.appData,
            entryList = appData.EntryList,
            onah = new Onah(this.state.jdate, this.state.nightDay),
            entry = new Entry(onah);
        if (entryList.list.find(e => e.isSameEntry(entry))) {
            Alert.alert('Entry already exists',
                `The entry for ${entry.toString()} is already in the list.`);
            return;
        }
        DataUtils.EntryToDatabase(entry).then(() => {
            entryList.add(entry);
            entryList.calulateHaflagas();
            appData.EntryList = entryList;
            this.setState({ appData: appData });
            if (this.onUpdate) {
                this.onUpdate(appData);
            }
            popUpMessage(`The entry for ${entry.toString()} has been successfully added.`,
                'Add Entry');
            if (appData.Settings.calcKavuahsOnNewEntry) {
                const possList = Kavuah.getPossibleNewKavuahs(appData.EntryList.list, appData.KavuahList);
                if (possList.length) {
                    this.navigate('FindKavuahs', {
                        appData: appData,
                        onUpdate: this.onUpdate,
                        possibleKavuahList: possList
                    });
                }
                else {
                    this.dispatch(NavigationActions.back());
                }
            }
            else {
                this.dispatch(NavigationActions.back());
            }
        }
        ).catch(error => {
            if (__DEV__) {
                console.warn('Error trying to add entry to the database.');
                console.error(error);
            }
        });
    }
    render() {
        const jdate = this.state.jdate,
            lastYear = jdate.Year - 1,
            twoYearsBack = lastYear - 1,
            daysOfMonth = Array.from({length: 30}, (v, i) => i + 1);
        return <ScrollView style={GeneralStyles.container}>
            {this.showWarning &&
                <View style={{ flex: 1, backgroundColor: '#ff9' }}>
                    <Text style={{ color: '#f00', fontWeight: 'bold' }}>
                        {'PLEASE BE AWARE: as it is now after sunset,\n' +
                            'the jewish date is currently ' +
                            this.state.jdate.addDays(1).toString()}</Text>
                </View>
            }
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Day</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={jdate.Day}
                    onValueChange={value => this.setState({ jdate: new jDate(jdate.Year, jdate.Month, value) })}>
                    {daysOfMonth.map(d =>
                        <Picker.Item label={d.toString()} value={d} key={d} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Month</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={jdate.Month}
                    onValueChange={value => this.setState({ jdate: new jDate(jdate.Year, value, jdate.Day) })}>
                    {Utils.jMonthsEng.map((m, i) =>
                        <Picker.Item label={m || 'Choose a Month'} value={i} key={i} />
                    )}
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Year</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={jdate.Year}
                    onValueChange={value => this.setState({ jdate: new jDate(value, jdate.Month, jdate.Day) })}>
                    <Picker.Item label={jdate.Year.toString()} value={jdate.Year} key={jdate.Year} />
                    <Picker.Item label={lastYear.toString()} value={lastYear} key={lastYear} />
                    <Picker.Item label={twoYearsBack.toString()} value={twoYearsBack} key={twoYearsBack} />
                </Picker>
            </View>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Onah - Day or Night?</Text>
                <Picker style={GeneralStyles.picker}
                    selectedValue={this.state.nightDay}
                    onValueChange={value => this.setState({ nightDay: value })}>
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