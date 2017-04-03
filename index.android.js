import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AppRegistry, StyleSheet, Text, View, Image, DrawerLayoutAndroid, ToolbarAndroid } from 'react-native';
import './App/Code/initAndroid';
import MainLists from './App/Components/MainLists';
import SingleDayDisplay from './App/Components/SingleDayDisplay';
import ChangeSettings from './App/Components/ChangeSettings';
import jDate from './App/Code/JCal/jDate';
import AppData from './App/Code/Data/AppData';
import DataUtils from './App/Code/Data/DataUtils';
import ProblemOnahs from './App/Code/Chashavshavon/ProblemOnah';

export default class LuachAndroid extends React.Component {
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
                currLocation: ad.Settings.location,
                listName: 'Entries',
                listItems: ad.EntryList.descending.map(e => e.toString() + '.')
            });
            this._changeSettings.setState({
                settings: this.state.appData.Settings,
                locations: this.state.appData.Locations
            });
        });
    }
    getListForDisplay(listName) {
        let li;
        if (!listName) {
            listName = this.state.listName;
        }
        if (listName) {
            switch (listName) {
                case 'Entries':
                    li = this.state.appData.EntryList.descending.map(e => e.toString() + '.');
                    break;
                case 'Kavuahs':
                    li = this.state.appData.KavuahList.map(k => k.toString() + '.');
                    break;
                case 'Dates':
                    li = this.state.appData.ProblemOnahs.map(po => po.toString() + '.');
            }
        }
        return li;
    }
    updateList(listName) {
        if (!this.state.appData) {
            return;
        }
        const li = this.getListForDisplay(listName);
        if (li) {
            this.setState({ listItems: li, listName: listName });
        }
    }
    updateSettings() {
        const settings = this.state.appData.Settings;
        settings.save();
        //Now that the setings may have been changed, we need to recalculate the problem onahs.
        const ad = this.recalulateProbs(),
            //In case the "Dates" list is showing
            listItems = this.getListForDisplay();

        this.setState({
            appData: ad,
            currLocation: settings.location,
            listItems: listItems
        });
    }
    /**
    * Recalculates the problem onahs for the state AppData object and returns it.
    * This should be done after updating settings, entries or kavuahs.
    */
    static recalulateProbs() {
        const appData = this.state.appData;
        if (appData) {
            const elist = appData.EntryList,
                klist = appData.KavuahList,
                probs = elist.getProblemOnahs(klist);
            appData.ProblemOnahs = probs;
        }
        return appData;
    }
    render() {
        const currProbs = (this.state.appData &&
            ProblemOnahs.getProbsForDate(this.state.currDate, this.state.appData.ProblemOnahs)) || [],
            navigationView = (<View style={{ flex: 1, backgroundColor: '#f1f1f1' }}>
                <ChangeSettings ref={cs => this._changeSettings = cs} />
            </View>);
        return (
            <DrawerLayoutAndroid
                ref={drawer => this._drawer = drawer}
                drawerWidth={300}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={() => navigationView}
                onDrawerClose={this.updateSettings.bind(this)}>
                <View style={styles.container}>
                    <View style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
                        <Image source={require('./App/Images/logo.png')} style={{ width: 40, height: 40, flex: 0, marginRight: 10 }} />
                        <SingleDayDisplay jdate={this.state.currDate} location={this.state.currLocation} problems={currProbs} />
                    </View>
                    <MainLists listName={this.state.listName} listItems={this.state.listItems} />
                    <View style={styles.innerToolbar}>
                        <Text style={styles.settingsButton} onPress={() => this._drawer.openDrawer()}>
                            <Icon name="gear" style={styles.toolButtonIcon} />
                            {'\n'}
                            Settings</Text>
                        <Text style={styles.toolbarButton} onPress={() => this.updateList('Entries')}>
                            <Icon name="list" style={styles.toolButtonIcon} />
                            {'\n'}
                            Entries</Text>
                        <Text style={styles.toolbarButton} onPress={() => this.updateList('Kavuahs')}>
                            <Icon name="object-ungroup" style={styles.toolButtonIcon} />
                            {'\n'}
                            Kavuahs</Text>
                        <Text style={styles.toolbarButton} onPress={() => this.updateList('Dates')}>
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
        marginTop: 10
    },
    settingsButton: {
        fontSize: 13,
        color: '#AB8421',
        textAlign: 'center',
        flex: 1
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
