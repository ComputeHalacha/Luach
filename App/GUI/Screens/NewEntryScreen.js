import React from 'react';
import { ScrollView, View, Text, Button, Switch, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Icon } from 'react-native-elements';
import SideMenu from '../Components/SideMenu';
import OnahChooser from '../Components/OnahChooser';
import Entry from '../../Code/Chashavshavon/Entry';
import { Kavuah } from '../../Code/Chashavshavon/Kavuah';
import Utils from '../../Code/JCal/Utils';
import { NightDay, Onah } from '../../Code/Chashavshavon/Onah';
import DataUtils from '../../Code/Data/DataUtils';
import { warn, error, popUpMessage } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

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
            this.entry = entry;
            jdate = entry.date;
            isNight = entry.nightDay === NightDay.Night;
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
            appData.EntryList = entryList;
            popUpMessage(`The entry for ${entry.toString()} has been successfully added.`,
                'Add Entry');
            this.checkIfOutOfPattern(entry);
            if (this.onUpdate) {
                this.onUpdate(appData);
            }
            if (appData.Settings.calcKavuahsOnNewEntry) {
                const possList = Kavuah.getPossibleNewKavuahs(
                    appData.EntryList.realEntrysList,
                    appData.KavuahList,
                    appData.Settings);
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
            if (this.onUpdate) {
                this.onUpdate(appData);
            }
            popUpMessage(`The entry for ${entry.toString()} has been successfully saved.`,
                'Change Entry');
            this.checkIfOutOfPattern(entry);
            if (appData.Settings.calcKavuahsOnNewEntry) {
                const possList = Kavuah.getPossibleNewKavuahs(
                    appData.EntryList.realEntrysList,
                    appData.KavuahList,
                    appData.Settings);
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
        let kavuahList = appData.KavuahList;

        const kavuahs = kavuahList.filter(k => k.settingEntry.isSameEntry(entry));
        Alert.alert(
            'Confirm Entry Removal',
            kavuahs.length > 0 ?
                `The following Kavuah/s were set by this Entry and will need to be removed if you remove this Entry:
                        ${kavuahs.map(k => '\n\t* ' + k.toString())}
                        Are you sure that you want to remove this/these Kavuah/s together with this entry?`:
                'Are you sure that you want to completely remove this Entry?',
            [   //Button 1
                { text: 'Cancel', onPress: () => { return; }, style: 'cancel' },
                //Button 2
                {
                    text: 'OK', onPress: () => {
                        for (let k of kavuahs) {
                            DataUtils.DeleteKavuah(k).catch(err => {
                                warn('Error trying to delete a Kavuah from the database.');
                                error(err);
                            });
                        }
                        DataUtils.DeleteEntry(entry)
                            .then(() => {
                                popUpMessage(`The entry for ${entry.toString()} has been successfully removed.`,
                                    'Remove entry');
                                if (onUpdate) {
                                    onUpdate(appData);
                                }
                            })
                            .catch(err => {
                                warn('Error trying to delete an entry from the database.');
                                error(err);
                            });
                    }
                }]);
    }
    /**
     * If a newly added or edited Entry is out of pattern for a strong Kavuah,
     * we will suggest to set the Kavuah to not Cancel Onah Beinonis.
     * @param {Entry} entry
     */
    checkIfOutOfPattern(entry) {
        const appData = this.state.appData,
            kavuahList = appData.KavuahList,
            entryList = appData.EntryList,
            outOfPatternKavuah = Kavuah.isOutOfPattern(entry, kavuahList, entryList);

        if (outOfPatternKavuah) {
            Alert.alert('Kavuah Pattern Break',
                `The entry of "${entry.toString()}" does not seem to match the Kavuah pattern of "${outOfPatternKavuah.toString()}".` +
                '\nDo you wish to set this Kavuah to NOT Cancel Onah Beinonis?',
                [
                    //Button 1
                    { text: 'No', onPress: () => { return; } },
                    //Button 2
                    {
                        text: 'Yes', onPress: () => {
                            outOfPatternKavuah.cancelsOnahBeinunis = false;
                            DataUtils.KavuahToDatabase(outOfPatternKavuah)
                                .then(() => {
                                    if (this.onUpdate) {
                                        this.onUpdate(appData);
                                    }
                                })
                                .catch(err => {
                                    warn('Error trying to add entry to the database.');
                                    error(err);
                                });
                        }
                    }]);
        }
    }
    render() {
        return <View style={GeneralStyles.container}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <SideMenu
                    onUpdate={this.onUpdate}
                    appData={this.state.appData}
                    navigator={this.props.navigation}
                    helpUrl='Entries.html'
                    helpTitle='Entries' />
                <ScrollView style={{ flex: 1 }}>
                    <OnahChooser
                        jdate={this.state.jdate}
                        nightDay={this.state.nightDay}
                        setDate={jdate => this.setState({ jdate })}
                        setNightDay={nightDay => this.setState({ nightDay })} />
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