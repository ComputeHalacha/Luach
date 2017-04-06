import React, { Component } from 'react';
import { ScrollView, View, StyleSheet, Text, Picker, Switch } from 'react-native';

export default class EntryScreen extends Component {
    static navigationOptions = {
        title: 'Entries',
    };
    constructor(props) {
        super(props);

        this.navigate = this.props.navigation.navigate;

        const { params } = this.props.navigation.state,
            appData = params.appData;
        this.state = {
            entryList: appData.EntryList
        };
    }
    render() {
        return (
            <ScrollView style={styles.container}>
                <Text style={styles.header}>Entries</Text>
            </ScrollView>);
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: {
        backgroundColor: '#fe9', color: '#977', padding: 5, flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 14
    },
    formRow: { flex: 1, flexDirection: 'column' },
    label: { margin: 0, backgroundColor: '#f5f5e8', padding: 10 },
    picker: { margin: 0 },
    switch: { margin: 5, alignSelf: 'flex-start' }
});