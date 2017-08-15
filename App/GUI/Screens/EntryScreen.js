import React, { Component } from 'react';
import { ScrollView, Text, View, Alert, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import SideMenu from '../Components/SideMenu';
import CustomList from '../Components/CustomList';
import DataUtils from '../../Code/Data/DataUtils';
import AppData from '../../Code/Data/AppData';
import JDate from '../../Code/JCal/jDate';
import { warn, error, popUpMessage } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class EntryScreen extends Component {
    static navigationOptions = {
        title: 'List of Entries'
    };
    constructor(props) {
        super(props);

        this.navigate = this.props.navigation.navigate;

        const { appData, onUpdate } = this.props.navigation.state.params;

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
                kavuahs.length > 0 ?
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
                            for (let k of kavuahs) {
                                DataUtils.DeleteKavuah(k).catch(err => {
                                    warn('Error trying to delete a Kavuah from the database.');
                                    error(err);
                                });
                            }
                            DataUtils.DeleteEntry(entry)
                                .then(() => {
                                    AppData.getAppData().then(appData => {
                                        this.setState({ appData: appData });
                                        this.update(appData);
                                        popUpMessage(`The entry for ${entry.toString()} has been successfully removed.`,
                                            'Remove entry');
                                    });
                                })
                                .catch(err => {
                                    warn('Error trying to delete an entry from the database.');
                                    error(err);
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
        const entryList = this.state.appData.EntryList && this.state.appData.EntryList.descending;
        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.onUpdate}
                        appData={this.state.appData}
                        navigator={this.props.navigation}
                        hideEntries={true}
                        helpUrl='Entries.html'
                        helpTitle='Entries' />
                    <ScrollView style={{ flex: 1 }}>
                        <View style={[GeneralStyles.buttonList, GeneralStyles.headerButtons]}>
                            <TouchableHighlight onPress={this.newEntry}>
                                <View style={{ alignItems: 'center' }}>
                                    <Icon
                                        size={9}
                                        reverse
                                        name='add'
                                        color='#484'
                                    />
                                    <Text style={{
                                        fontSize: 9,
                                        color: '#262',
                                        fontStyle: 'italic'
                                    }}>New Entry</Text>
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight onPress={this.findKavuahs}>
                                <View style={{ alignItems: 'center' }}>
                                    <Icon
                                        size={9}
                                        reverse
                                        name='search'
                                        color='#669'
                                    />
                                    <Text style={{
                                        fontSize: 9,
                                        color: '#669',
                                        fontStyle: 'italic'
                                    }}>Calculate Possible Kavuahs</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                        <CustomList
                            data={entryList}
                            nightDay={entry => entry.nightDay}
                            title={entry => entry.toLongString()}
                            keyExtractor={(item, index) => item.entryId || index.toString()}
                            emptyListText='There are no Entries in the list'
                            secondSection={entry => {
                                const hasKavuahs = this.state.appData.KavuahList.some(k =>
                                    (!k.ignore) && k.settingEntry.isSameEntry(entry));
                                return <View style={GeneralStyles.inItemButtonList}>
                                    <TouchableHighlight
                                        underlayColor='#696'
                                        style={{ flex: 1 }}
                                        onPress={() => this.navigate('Home', { currDate: entry.date, appData: this.state.appData })}>
                                        <View style={{ alignItems: 'center' }}>
                                            <Icon
                                                name='event-note'
                                                color='#585'
                                                size={15}
                                                containerStyle={GeneralStyles.inItemLinkIcon} />
                                            <Text style={GeneralStyles.inItemLinkText}>Go to Date</Text>
                                        </View>
                                    </TouchableHighlight>
                                    {(!hasKavuahs) &&
                                        <TouchableHighlight
                                            underlayColor='#788778'
                                            style={{ flex: 1 }}
                                            onPress={() => this.navigate('NewEntry', {
                                                entry: entry,
                                                appData: this.state.appData,
                                                onUpdate: this.update
                                            })}>
                                            <View style={{ alignItems: 'center' }}>
                                                <Icon
                                                    name='edit'
                                                    color='#99a999'
                                                    size={18}
                                                    containerStyle={GeneralStyles.inItemLinkIcon} />
                                                <Text style={GeneralStyles.inItemLinkText}>Edit</Text>
                                            </View>
                                        </TouchableHighlight>
                                    }
                                    <TouchableHighlight
                                        onPress={() => this.newKavuah(entry)}
                                        underlayColor='#aaf'
                                        style={{ flex: 1 }}>
                                        <View style={{ alignItems: 'center' }}>
                                            <Icon
                                                name='device-hub'
                                                color='#aaf'
                                                size={20}
                                                containerStyle={GeneralStyles.inItemLinkIcon} />
                                            <Text style={GeneralStyles.inItemLinkText}>New Kavuah</Text>
                                        </View>
                                    </TouchableHighlight>
                                    <TouchableHighlight
                                        underlayColor='#faa'
                                        style={{ flex: 1 }}
                                        onPress={() => this.deleteEntry(entry)}>
                                        <View style={{ alignItems: 'center' }}>
                                            <Icon
                                                name='delete-forever'
                                                color='#faa'
                                                size={20}
                                                containerStyle={GeneralStyles.inItemLinkIcon} />
                                            <Text style={GeneralStyles.inItemLinkText}>Remove</Text>
                                        </View>
                                    </TouchableHighlight>
                                </View>;
                            }}
                        />
                    </ScrollView>
                </View>
            </View>);
    }
}