import React from 'react';
import { StyleSheet, Text, View, ScrollView, ListView } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import SingleDayDisplay from './SingleDayDisplay';
import jDate from '../Code/JCal/jDate';
import Location from '../Code/JCal/Location';
import AppData from '../Code/Data/AppData';
import ProblemOnahs from '../Code/Chashavshavon/ProblemOnah';

// Row comparison function
const rowHasChanged = (r1, r2) => {
    r1.Abs !== r2.Abs;
};
// DataSource template object
const ds = new ListView.DataSource({ rowHasChanged });

export default class HomeScreen extends React.Component {
    static navigationOptions = {
        title: 'Luach',
        permalink: '',
        header: {
            visible: false,
        }
    };
    static today = new jDate();

    constructor(props) {
        super(props);
        const daysList = [
            HomeScreen.today.addDays(-1),
            HomeScreen.today,
            HomeScreen.today.addDays(1)];
        this.state = {
            daysList: daysList,
            appData: null,
            currDate: HomeScreen.today,
            currLocation: null,
            dataSource: ds.cloneWithRows(daysList)
        };
        AppData.getAppData().then(ad => {
            this.setState({
                appData: ad,
                currLocation: ad.Settings.location
            });
            this._listView.scrollTo({ x: 260, y: 0 });

        });
        this.navigate = this.props.navigation.navigate;
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
    recalulateProbs() {
        const appData = this.state.appData;
        if (appData) {
            const elist = appData.EntryList,
                klist = appData.KavuahList,
                probs = elist.getProblemOnahs(klist);
            appData.ProblemOnahs = probs;
        }
        return appData;
    }
    addDays() {
        const daysList = this.state.daysList;
        daysList.push(daysList[daysList.length - 1].addDays(1));
        this.setState({
            daysList: daysList,
            dataSource: ds.cloneWithRows(daysList)
        });
    }
    listScroll() {
        const { offset } = this._listView.scrollProperties;
        if (offset < 40) {
            const daysList = this.state.daysList;
            daysList.unshift(daysList[0].addDays(-1));
            this.setState({
                daysList: daysList,
                dataSource: ds.cloneWithRows(daysList)
            }, () =>
                    this._listView.scrollTo({ x: offset + 260, y: 0, animate: false })
            );
        }
    }
    renderDay(day) {
        return (<SingleDayDisplay
            jdate={day}
            location={this.state.currLocation || Location.getJerusalem()}
            problems={ProblemOnahs.getProbsForDate(day, this.state.appData && this.state.appData.ProblemOnahs)}
            isToday={HomeScreen.today.Abs === day.Abs}
            appData={this.state.appData}
            navigate={this.navigate} />);
    }
    render() {
        const menuList = [
            {
                title: 'Settings',
                icon: 'settings',
                onPress: () => this.navigate('Settings', { appData: this.state.appData })
            },
            {
                title: 'Kavuahs',
                icon: 'device-hub',
                onPress: () => this.navigate('Kavuahs', { appData: this.state.appData })
            },
            {
                title: 'Entries',
                icon: 'list',
                onPress: () => this.navigate('Entries', { appData: this.state.appData })
            },
            {
                title: 'Dates',
                icon: 'flag',
                onPress: () => this.navigate('FlaggedDates', { appData: this.state.appData })
            }

        ];
        return (
            <ScrollView style={{ flex: 1 }}>
                <View contentContainerStyle={styles.container}>
                    <ListView
                        ref={listView => this._listView = listView}
                        horizontal
                        initialListSize={3}
                        pageSize={3}
                        removeClippedSubviews
                        renderRow={this.renderDay.bind(this)}
                        dataSource={this.state.dataSource}
                        onEndReached={this.addDays.bind(this)}
                        onScroll={this.listScroll.bind(this)}
                    />
                </View>
                <ScrollView>
                    <List>
                        {menuList.map((item, i) => (
                            <ListItem
                                key={i}
                                title={item.title}
                                leftIcon={{ name: item.icon }}
                                onPress={item.onPress}
                                containerStyle={{}} />
                        ))}
                    </List>
                </ScrollView>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        DO NOT depend halachically upon this application</Text>
                </View>
            </ScrollView>);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 15,
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