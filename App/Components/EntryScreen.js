import React, { Component } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { List, ListItem, Icon } from 'react-native-elements';
import JDate from '../Code/JCal/jDate';


export default class EntryScreen extends Component {
    static navigationOptions = {
        title: 'Entries',
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
    render() {
        return (
            <ScrollView style={styles.container}>
                <Icon name='add-circle' onPress={this.newEntry.bind(this)} />
                <List>
                    {this.state.entryList.list.map(entry => (
                        <ListItem
                            key={entry.entryId}
                            title={entry.toString()}
                            leftIcon={{ name: 'list' }} />
                    ))}
                </List>
            </ScrollView>);
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' }
});