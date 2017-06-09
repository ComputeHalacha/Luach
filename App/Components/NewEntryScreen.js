import React from 'react';
import { ScrollView, View, Text, Picker, Button, Switch, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Icon } from 'react-native-elements';
import SideMenu from './SideMenu';
import Entry from '../Code/Chashavshavon/Entry';
import { Kavuah } from '../Code/Chashavshavon/Kavuah';
import Utils from '../Code/JCal/Utils';
import jDate from '../Code/JCal/jDate';
import { NightDay, Onah } from '../Code/Chashavshavon/Onah';
import DataUtils from '../Code/Data/DataUtils';
import { warn, error, popUpMessage, range } from '../Code/GeneralUtils';
import { GeneralStyles } from './styles';

export default class NewEntry extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { entry, appData, onUpdate } = navigation.state.params;
        return {
            title: entry ? 'Edit Entry' : 'New Entry',
            headerRight: entry &&
            <Icon name='delete-forever'
                color='#a33'
                size={20}
                onPress={() => NewEntry.deleteEntry(entry, appData, ad => {
                    if (onUpdate) {
                        onUpdate(ad);
                    }
                    navigation.dispatch(NavigationActions.back());
                })} />
        };
    };

    constructor(props) {
        super(props);
        const navigation = this.props.navigation;

        this.navigate = navigation.navigate;
        this.dispatch = navigation.dispatch;

        const { entry, appData, onUpdate } = navigation.state.params,
            location = appData.Settings.location;

        this.onUpdate = onUpdate;

        let jdate, isNight;
        if (entry) {
            const hasKavuah = appData.KavuahList.some(k =>
                k.settingEntry.isSameEntry(entry));
            if (hasKavuah) {
                popUpMessage('This Entry has been set as "Setting Entry" for a Kavuah and can not be changed.',
                    'Entry cannot be changed');
                this.dispatch(NavigationActions.back());
            }
            else {
                this.entry = entry;
                jdate = entry.date;
                isNight = entry.nightDay === NightDay.Night;
            }
        }
        else {
            jdate = navigation.state.params.jdate;
            isNight = Utils.isAfterSunset(new Date(), location);
        }

        this.state = {
            appData: appData,
            jdate: jdate,
            nightDay: isNight ? NightDay.Night : NightDay.Day,
            ignoreForFlaggedDates: entry && entry.ignoreForFlaggedDates,
            ignoreForKavuah: entry && entry.ignoreForKavuah,
            comments: (entry && entry.comments) || '',
            showAdvancedOptions: (entry && (entry.ignoreForFlaggedDates || entry.ignoreForKavuah))
        };



        this.addEntry = this.addEntry.bind(this);
        this.updateEntry = this.updateEntry.bind(this);
    }
    addEntry() {
        const appData = this.state.appData,
            entryList = appData.EntryList,
            onah = new Onah(this.state.jdate, this.state.nightDay),
            entry = new Entry(
                onah,
                undefined,
                this.state.ignoreForFlaggedDates,
                this.state.ignoreForKavuah,
                this.state.comments);
        if (entryList.list.find(e => e.isSameEntry(entry))) {
            popUpMessage(`The entry for ${entry.toString()} is already in the list.`,
                'Entry already exists');
            return;
        }
        DataUtils.EntryToDatabase(entry).then(() => {
            entryList.add(entry);
            entryList.calulateHaflagas();
            appData.EntryList = entryList;
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
        ).catch(err => {
            warn('Error trying to add entry to the database.');
            error(err);
        });
    }
    updateEntry() {
        const appData = this.state.appData,
            entryList = appData.EntryList,
            onah = new Onah(this.state.jdate, this.state.nightDay),
            entry = this.entry;
        entry.onah = onah;
        entry.ignoreForFlaggedDates = this.state.ignoreForFlaggedDates;
        entry.ignoreForKavuah = this.state.ignoreForKavuah;
        entry.comments = this.state.comments;

        if (entryList.list.find(e => e !== entry && e.isSameEntry(entry))) {
            popUpMessage(`The entry for ${entry.toString()} is already in the list.`,
                'Entry already exists');
            return;
        }
        DataUtils.EntryToDatabase(entry).then(() => {
            entryList.calulateHaflagas();
            appData.EntryList = entryList;
            if (this.onUpdate) {
                this.onUpdate(appData);
            }
            popUpMessage(`The entry for ${entry.toString()} has been successfully saved.`,
                'Change Entry');
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
        ).catch(err => {
            warn('Error trying to add save the changes to the database.');
            error(err);
        });
    }
    /**
     * Delete an Entry from the database and from the given AppData, then run the onUpdate function with the altered AppData.
     * @param {Entry} entry
     * @param {AppData} appData
     * @param {Function} onUpdate
     */
    static deleteEntry(entry, appData, onUpdate) {
        let entryList = appData.EntryList,
            kavuahList = appData.KavuahList;

        const kavuahs = kavuahList.filter(k => k.settingEntry.isSameEntry(entry));
        Alert.alert(
            'Confirm Entry Removal',
            kavuahs.length > 0 ?
                `The following Kavuah/s were set by this Entry and will need to be removed if you remove this Entry:
                        ${kavuahs.map(k => '\n\t* ' + k.toString())}
                        Are you sure that you want to remove this/these Kavuah/s together with this entry?`:
                'Are you sure that you want to completely remove this Entry?',
            [   //Button 1
                {
                    text: 'Cancel',
                    onPress: () => { return; },
                    style: 'cancel'
                },
                //Button 2
                {
                    text: 'OK', onPress: () => {
                        DataUtils.DeleteEntry(entry).catch(err => {
                            warn('Error trying to delete an entry from the database.');
                            error(err);
                        });
                        for (let k of kavuahs) {
                            let index = kavuahList.indexOf(k);
                            DataUtils.DeleteKavuah(k).catch(err => {
                                warn('Error trying to delete a Kavuah from the database.');
                                error(err);
                            });
                            kavuahList.splice(index, 1);
                        }
                        entryList.remove(entry, e => {
                            entryList.calulateHaflagas();
                            appData.EntryList = entryList;
                            appData.KavuahList = kavuahList;
                            popUpMessage(`The entry for ${e.toString()} has been successfully removed.`,
                                'Remove entry');
                            if (onUpdate) {
                                onUpdate(appData);
                            }
                        });
                    }
                },
            ]);
    }
    render() {
        const jdate = this.state.jdate,
            lastYear = jdate.Year - 1,
            twoYearsBack = lastYear - 1,
            daysOfMonth = range(1, 30);
        return <View style={GeneralStyles.container}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <SideMenu
                    onUpdate={this.onUpdate}
                    appData={this.state.appData}
                    navigator={this.props.navigation}
                    hideOccasions={true} />
                <ScrollView style={{ flex: 1 }}>
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
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Comments</Text>
                        <TextInput style={GeneralStyles.textInput}
                            onEndEditing={event =>
                                this.setState({ comments: event.nativeEvent.text })}
                            defaultValue={this.state.comments}
                            placeholder='Enter any comments'
                            multiline={true}
                            maxLength={500} />
                    </View>
                    {(!this.state.showAdvancedOptions &&
                        <TouchableOpacity onPress={() => this.setState({ showAdvancedOptions: true })}>
                            <Text style={{
                                color: '#66b',
                                textAlign: 'center',
                                fontSize: 12
                            }}>Show Advanced Entry Options</Text>
                        </TouchableOpacity>)
                        ||
                        <View>
                            <View style={GeneralStyles.formRow}>
                                <Text style={[GeneralStyles.label, { fontSize: 11 }]}>[Advanced] Not a halachic Veset period. Should not generate Flagged Dates</Text>
                                <Switch style={GeneralStyles.switch}
                                    onValueChange={value => this.setState({ ignoreForFlaggedDates: value })}
                                    value={!!this.state.ignoreForFlaggedDates} />
                            </View>
                            <View style={GeneralStyles.formRow}>
                                <Text style={[GeneralStyles.label, { fontSize: 11 }]}>[Advanced] Ignore this Entry in Kavuah calculations</Text>
                                <Switch style={GeneralStyles.switch}
                                    onValueChange={value => this.setState({ ignoreForKavuah: value })}
                                    value={!!this.state.ignoreForKavuah} />
                            </View>
                        </View>
                    }
                    <View style={GeneralStyles.btnAddNew}>
                        <Button
                            title={this.entry ? 'Save Changes' : 'Add Entry'}
                            onPress={this.entry ? this.updateEntry : this.addEntry}
                            accessibilityLabel={this.entry ?
                                'Save Changes to this Entry' : 'Add this new Entry'}
                            color='#99b' />
                    </View>
                </ScrollView>
            </View>
        </View>;
    }
}