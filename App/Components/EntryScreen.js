import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { List, ListItem, Icon } from 'react-native-elements';
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
    newKavuah(entry)
    {
        this.navigate('NewKavuah', {
            appData: this.appData,
            settingEntry:entry
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
                            onLongPress={() => this.newKavuah.bind(this)(entry)} />
                    ))}
                </List>
            </ScrollView>);
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' }
});