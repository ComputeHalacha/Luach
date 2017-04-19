import React, { Component } from 'react';
import { ScrollView, Text, View, Alert } from 'react-native';
import { List, ListItem, Button, Icon } from 'react-native-elements';
import DataUtils from '../Code/Data/DataUtils';
import JDate from '../Code/JCal/jDate';
import {GeneralStyles} from './styles';

export default class EntryScreen extends Component {
    static navigationOptions = {
        title: 'List of Entries',
        right: <Icon name='add-circle' onPress={this.newEntry} />,
    };
    constructor(props) {
        super(props);

        this.navigate = this.props.navigation.navigate;

        const { appData, currLocation } = this.props.navigation.state.params;

        this.appData = appData;
        this.currLocation = currLocation;
        this.state = {
            entryList: appData.EntryList
        };
        this.newEntry.bind(this);
    }
    newEntry() {
        this.navigate('NewEntry', {
            jdate: new JDate(),
            location: this.currLocation,
            appData: this.appData
        });
    }
    deleteEntry(entry) {
        DataUtils.DeleteEntry(entry).then(() => {
            const appData = this.state.appData;
            let entryList = appData.EntryList,
                kavuahList = appData.KavuahList,
                index = entryList.list.indexOf(entry);
            if (index > -1) {
                const kavuahs = kavuahList.filter(k => k.settingEntry.entryId === entry.entryId);
                Alert.alert(
                    'Confirm Entry Removal',
                    kavuahs.length ?
                        `The following Kavuah/s were set by this Entry and will need to be removed if you remove this Entry:
                        ${kavuahs.map(k => '\n\t* ' + k.toString())}
                        Are you sure that you want to remove this/these Kavuah/s together with the entry?`:
                        'Are you sure that you want to remove this Entry?',
                    [
                        //Button 1
                        { text: 'Cancel', onPress: () => { return; }, style: 'cancel' },
                        //Button 2
                        {
                            text: 'OK', onPress: () => {
                                for (let k of kavuahs) {
                                    let index = kavuahList.indexOf(k);
                                    DataUtils.DeleteKavuah(k);
                                    kavuahList = kavuahList.splice(index, 1);
                                }
                                entryList.list = entryList.list.splice(index, 1);
                                entryList.calulateHaflagas();
                                appData.EntryList = entryList;
                                appData.KavuahList = kavuahList;
                                this.setState({
                                    appData: appData,
                                    entryList: appData.EntryList
                                });
                                Alert.alert('Remove entry',
                                    `The entry for ${entry.toString()} has been successfully removed.`);
                            }
                        },
                    ]);

            }
        }
        ).catch(error => {
            console.warn('Error trying to delete an entry from the database.');
            console.error(error);
        });
    }
    newKavuah(entry) {
        this.navigate('NewKavuah', {
            appData: this.appData,
            settingEntry: entry
        });
    }
    render() {
        return (
            <ScrollView style={GeneralStyles.container}>
                <Text>To add a new Kavuah for any entry, do a long press on the Entry.</Text>
                <List>
                    {this.state.entryList.descending.map(entry => (
                        <ListItem
                            key={entry.entryId}
                            title={entry.toString()}
                            leftIcon={{ name: 'list' }}
                            hideChevron
                            subtitle={
                                <View style={GeneralStyles.buttonList}>
                                    <Button
                                        title='Remove'
                                        icon={{ name: 'delete-forever' }}
                                        backgroundColor='#f50'
                                        onPress={() => this.deleteEntry.bind(this)(entry)} />
                                    <Button
                                        title='New Kavuah'
                                        icon={{ name: 'device-hub' }}
                                        backgroundColor='#05f'
                                        onPress={() => this.newKavuah.bind(this)(entry)} />
                                </View>}
                        />
                    ))}
                </List>
            </ScrollView>);
    }
}