import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { List, ListItem, Button } from 'react-native-elements';
import DataUtils from '../Code/Data/DataUtils';
import JDate from '../Code/JCal/jDate';


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
                index = entryList.indexOf(entry);
            if (index > -1) {
                entryList = entryList.splice(index, 1);
                entryList.calulateHaflagas();
                appData.EntryList = entryList;
                this.setState({
                    appData: appData,
                    entryList: appData.EntryList
                });
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
            <ScrollView style={styles.container}>
                <Text>To add a new Kavuah for any entry, do a long press on the Entry.</Text>
                <List>
                    {this.state.entryList.descending.map(entry => (
                        <ListItem
                            key={entry.entryId}
                            title={entry.toString()}
                            leftIcon={{ name: 'list' }}
                            hideChevron
                            subtitle={
                                <View style={styles.buttonList}>
                                    <Button
                                        title='Remove'
                                        icon={{name:'delete-forever'}}
                                        backgroundColor='#f50'
                                        onPress={() => this.deleteEntry.bind(this)(entry)} />
                                    <Button
                                        title='New Kavuah'
                                        icon={{name:'device-hub'}}
                                        backgroundColor='#05f'
                                        onPress={() => this.newKavuah.bind(this)(entry)} />
                                </View>}
                            />
                    ))}
                </List>
            </ScrollView>);
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    buttonList:{flexDiection:'row'}
});