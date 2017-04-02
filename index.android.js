import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AppRegistry, StyleSheet, Text, View, Image, DrawerLayoutAndroid } from 'react-native';
import './App/Code/initAndroid';
import MainLists from './App/Components/MainLists';
import SingleDayDisplay from './App/Components/SingleDayDisplay';
import ChangeSettings from './App/Components/ChangeSettings';
import jDate from './App/Code/JCal/jDate';
import AppData from './App/Code/Data/AppData';
import DataUtils from './App/Code/Data/DataUtils';

export default class LuachAndroid extends Component {
    constructor (props) {
        super(props);

        this.state = {
            appData: null,
            currDate: new jDate(),
            currLocation: null,
            listName: '',
            listItems: []
        };
        AppData.getAppData().then(ad => {
            this.setState({
                appData: ad,
                currLocation: ad.Settings.location
            });
            this.fillEntries();
        });
    }
    fillLocations() {
        DataUtils.SearchLocations('new').then(list =>
            this.setState({ listItems: list.map(l => l.Name), listName: 'Settings' }));
    }
    fillEntries() {
        if (this.state.appData) {
            const li = this.state.appData.EntryList.descending.map(e => e.toString() + '.');
            this.setState({ listItems: li, listName: 'List of Entries' });
        }
    }
    fillKavuahs() {
        if (this.state.appData) {
            const li = this.state.appData.KavuahList.map(k => k.toString() + '.');
            this.setState({ listItems: li, listName: 'List of Kavuahs' });
        }
    }
    fillProblems() {
        if (this.state.appData) {
            const li = this.state.appData.ProblemOnahs.map(po => po.toString() + '.');
            this.setState({ listItems: li, listName: 'List of Dates' });
        }
    }
    updateSettings() {

    }
    render() {
        const currProbs = this.state.appData && this.state.appData.ProblemOnahs.filter(po =>
            po.jdate.Abs === this.state.currDate.Abs),
            navigationView = (<View style={{ flex: 1, backgroundColor: '#f1f1f1' }}>
                <ChangeSettings settings={this.state.appData && this.state.appData.Settings} />
            </View>);
        return (
            <DrawerLayoutAndroid
                ref={drawer => this._drawer = drawer}
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={() => navigationView}
                onDrawerClose={this.updateSettings}>
                <View style={styles.container}>
                    <View style={styles.toolbar}>
                        <Text style={styles.settingsButton} onPress={() => this._drawer.openDrawer()}>
                            Change Settings</Text>
                    </View>
                    <Text>{'\n'}</Text>
                    <View style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
                        <Image source={require('./App/Images/logo.png')} style={{ width: 40, height: 40, flex: 0, marginRight: 10 }} />
                        <SingleDayDisplay jdate={this.state.currDate} location={this.state.currLocation} problems={currProbs} />
                    </View>
                    <MainLists listName={this.state.listName} listItems={this.state.listItems} />
                    <View style={styles.innerToolbar}>
                        <Text style={styles.toolbarButton} onPress={this.fillEntries.bind(this)}>
                            <Icon name="list" style={styles.toolButtonIcon} />
                            {'\n'}
                            Entries</Text>
                        <Text style={styles.toolbarButton} onPress={this.fillKavuahs.bind(this)}>
                            <Icon name="object-ungroup" style={styles.toolButtonIcon} />
                            {'\n'}
                            Kavuahs</Text>
                        <Text style={styles.toolbarButton} onPress={this.fillProblems.bind(this)}>
                            <Icon name="warning" style={styles.toolButtonIcon} />
                            {'\n'}
                            Dates</Text>
                    </View>
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            DO NOT depend halachikally upon this application</Text>
                    </View>
                </View>
            </DrawerLayoutAndroid>);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    settingsButton: {
        fontSize: 13,
        color: '#AB8421',
        textAlign: 'center',
        flex: 1
    },
    toolbar: {
        backgroundColor: '#f5f5e8',
        paddingTop: 10,
        paddingBottom: 10,
        flexDirection: 'row'
    },
    innerToolbar: {
        backgroundColor: '#f5f5e8',
        paddingTop: 10,
        paddingBottom: 4,
        flexDirection: 'row'
    },
    toolButtonIcon: {
        fontSize: 19
    },
    toolbarButton: {
        fontSize: 10,
        color: '#AB8421',
        textAlign: 'center',
        flex: 1
    },
    footer: {
        backgroundColor: '#FE9',
        padding: 5,
        flexDirection: 'row'
    },
    footerText: {
        fontSize: 11,
        flex: 1,
        textAlign: 'center',
        color: '#666'
    }
});

AppRegistry.registerComponent('LuachAndroid', () => LuachAndroid);
