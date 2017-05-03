import React, { Component } from 'react';
import { ScrollView, Text, View, Alert, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import CustomList from './CustomList';
import DataUtils from '../Code/Data/DataUtils';
import JDate from '../Code/JCal/jDate';
import { GeneralStyles } from './styles';

export default class EntryScreen extends Component {
    static navigationOptions = {
        title: 'List of Entries'
    };
    constructor(props) {
        super(props);

        this.navigate = this.props.navigation.navigate;

        const { appData, currLocation, onUpdate } = this.props.navigation.state.params;

        this.currLocation = currLocation;
        this.onUpdate = onUpdate;
        this.state = {
            appData: appData
        };
        this.newEntry = this.newEntry.bind(this);
        this.update = this.update.bind(this);
        this.findKavuahs = this.findKavuahs.bind(this);
        this.deleteEntry = this.deleteEntry.bind(this);
        this.newKavuah = this.newKavuah.bind(this);
    }
    update(appData) {
        if (appData) {
            this.setState({ apData: appData });
        }
        if (this.onUpdate) {
            this.onUpdate(appData);
        }
    }
    newEntry() {
        this.navigate('NewEntry', {
            jdate: new JDate(),
            location: this.currLocation,
            appData: this.state.appData,
            onUpdate: this.update
        });
    }
    deleteEntry(entry) {
        const appData = this.state.appData;
        let entryList = appData.EntryList,
            kavuahList = appData.KavuahList;
        if (entryList.contains(entry)) {
            const kavuahs = kavuahList.filter(k => k.settingEntry.isSameEntry(entry));
            Alert.alert(
                'Confirm Entry Removal',
                kavuahs.length ?
                    `The following Kavuah/s were set by this Entry and will need to be removed if you remove this Entry:
                        ${kavuahs.map(k => '\n\t* ' + k.toString())}
                        Are you sure that you want to remove this/these Kavuah/s together with the entry?`:
                    'Are you sure that you want to remove this Entry?',
                [   //Button 1
                    {
                        text: 'Cancel',
                        onPress: () => { return; },
                        style: 'cancel'
                    },
                    //Button 2
                    {
                        text: 'OK', onPress: () => {
                            DataUtils.DeleteEntry(entry).catch(error => {
                                if (__DEV__) {
                                    console.warn('Error trying to delete an entry from the database.');
                                    console.error(error);
                                }
                            });
                            for (let k of kavuahs) {
                                let index = kavuahList.indexOf(k);
                                DataUtils.DeleteKavuah(k).catch(error => {
                                    if (__DEV__) {
                                        console.warn('Error trying to delete a Kavuah from the database.');
                                        console.error(error);
                                    }
                                });
                                kavuahList.splice(index, 1);
                            }
                            entryList.remove(entry, e => {
                                entryList.calulateHaflagas();
                                appData.EntryList = entryList;
                                appData.KavuahList = kavuahList;
                                this.update(appData);
                                Alert.alert('Remove entry',
                                    `The entry for ${e.toString()} has been successfully removed.`);
                            });
                        }
                    },
                ]);

        }
    }
    newKavuah(entry) {
        this.navigate('NewKavuah', {
            appData: this.state.appData,
            settingEntry: entry,
            onUpdate: this.update
        });
    }
    findKavuahs() {
        this.navigate('FindKavuahs', {
            appData: this.state.appData,
            onUpdate: this.update
        });
    }
    render() {
        return (
            <ScrollView style={GeneralStyles.container}>
                <View style={[GeneralStyles.buttonList, GeneralStyles.headerButtons]}>
                    <TouchableHighlight onPress={this.newEntry}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon
                                size={12}
                                reverse
                                name='add'
                                color='#484'
                            />
                            <Text style={{
                                fontSize: 12,
                                color: '#262',
                                fontStyle: 'italic'
                            }}>New Entry</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={this.findKavuahs}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon
                                size={12}
                                reverse
                                name='search'
                                color='#669'
                            />
                            <Text style={{
                                fontSize: 12,
                                color: '#669',
                                fontStyle: 'italic'
                            }}>Calculate Possible Kavuahs</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                <CustomList
                    dataSource={this.state.appData.EntryList && this.state.appData.EntryList.list}
                    nightDay={entry => entry.nightDay}
                    title={entry => entry.toLongString()}
                    emptyListText='There are no Entries in the list'
                    secondSection={entry =>
                        <View style={[GeneralStyles.buttonList, { margin: 15 }]}>
                            <TouchableHighlight
                                underlayColor='#faa'
                                style={{ flex: 1 }}
                                onPress={() => this.deleteEntry(entry)}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon
                                        name='delete-forever'
                                        color='#faa'
                                        size={25} />
                                    <Text> Remove</Text>
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight
                                underlayColor='#696'
                                style={{ flex: 1 }}
                                onPress={() => this.navigate('Home', { currDate: entry.date, appData: this.state.appData })}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon
                                        name='event-note'
                                        color='#696'
                                        size={25} />
                                    <Text> Go to Date</Text>
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight
                                onPress={() => this.newKavuah(entry)}
                                underlayColor='#aaf'
                                style={{ flex: 1 }}>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon
                                        name='device-hub'
                                        color='#aaf'
                                        size={25} />
                                    <Text> New Kavuah</Text>
                                </View>
                            </TouchableHighlight>
                        </View>}
                />
            </ScrollView>);
    }
}