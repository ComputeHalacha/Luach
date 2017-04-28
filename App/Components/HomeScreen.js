import React from 'react';
import { Dimensions, StyleSheet, Text, View, ScrollView } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import Carousel from './Carousel/Carousel';
import SingleDayDisplay from './SingleDayDisplay';
import jDate from '../Code/JCal/jDate';
import Location from '../Code/JCal/Location';
import AppData from '../Code/Data/AppData';
import ProblemOnahs from '../Code/Chashavshavon/ProblemOnah';
import { UserOccasion } from '../Code/JCal/UserOccasion';

const { width } = Dimensions.get('window');

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

        this.navigate = props.navigation.navigate;
        this.setDayInformation = this.setDayInformation.bind(this);
        this.getDaysList = this.getDaysList.bind(this);

        //If this screen was navigated to from another screen.
        if (props.navigation.state && props.navigation.state.params) {
            this._navigatedShowing.bind(this)(props.navigation.state.params);
        }
        //We are on the initial showing of the app. We will load the appData from the database.
        else {
            this._initialShowing.bind(this)();
        }
    }
    /**
    * Recalculates each days data (such as occasions and problem onahs) for the state AppData object.
    * This should be done after updating settings, occasions, entries or kavuahs.
    */
    updateAppData(appData) {
        const ad = appData && appData instanceof AppData ? appData : this.state.appData,
            //As the data has been changed, we need to recalculate the problem onahs.
            elist = ad.EntryList,
            klist = ad.KavuahList,
            probs = elist.getProblemOnahs(klist);
        ad.ProblemOnahs = probs;

        //In case the problems or occasions have been changed, we need to update the days list
        const daysList = this.state.daysList;
        for (let singleDay of daysList) {
            this.setDayInformation(singleDay, ad);
        }

        this.setState({
            appData: ad,
            currLocation: ad.Settings.location,
            daysList: daysList
        });
    }
    onDayChanged(position, currentElement) {
        if (position === this.state.daysList.length - 1) {
            this._addDaysToEnd(position, currentElement);
        }
        else if (position === 0) {
            this._addDaysToBeginning(position, currentElement);
        }
    }
    _initialShowing() {
        const currDate = HomeScreen.today,
            daysList = this.getDaysList(currDate);
        //As we will be going to the database which takes some time, we set initial values for the state.
        this.state = {
            daysList: daysList,
            appData: null,
            currDate: currDate,
            currLocation: null,
            pageNumber: 1
        };

        //Get the data from the database
        AppData.getAppData().then(ad => {
            //Set each days props - such as entries, occasions and probs.
            for (let singleDay of daysList) {
                this.setDayInformation(singleDay, ad);
            }
            this.setState({
                appData: ad,
                daysList: daysList,
                currLocation: ad.Settings.location
            });
        });
    }
    _navigatedShowing(params) {
        //As this screen was navigated to from another screen, we will use the original appData.
        //We also allow another screen to naviate to any date by supplying a currDate property in the navigate props.
        const appData = params.appData,
            currDate = params.currDate || HomeScreen.today;
        //We don't need to use setState here as this function is only called from the constructor.
        this.state = {
            appData: appData,
            daysList: this.getDaysList(currDate, appData),
            currDate: currDate,
            currLocation: appData.Settings.location,
            pageNumber: 1
        };
    }
    _addDaysToEnd(position) {
        const daysList = this.state.daysList,
            day = daysList[daysList.length - 1].day.addDays(1);
        daysList.push(this.setDayInformation({ day }));
        this.setState({
            daysList: daysList,
            pageNumber: position
        });
    }
    _addDaysToBeginning() {
        const daysList = this.state.daysList,
            day = daysList[0].day.addDays(-1);
        daysList.unshift(this.setDayInformation({ day }));
        this.setState({
            daysList: daysList,
            pageNumber: 1
        });
    }
    getDaysList(jdate, appData) {
        appData = appData || (this.state && this.state.appData);
        const daysList = [this.setDayInformation({ day: jdate.addDays(-1) }, appData)];
        daysList.push(this.setDayInformation({ day: jdate }, appData));
        daysList.push(this.setDayInformation({ day: jdate.addDays(1) }, appData));

        return daysList;
    }
    setDayInformation(singleDay, appData) {
        appData = appData || (this.state && this.state.appData);

        singleDay.probs = appData && appData.Settings.showProbFlagOnHome ?
            ProblemOnahs.getProbsForDate(singleDay.day, appData && appData.ProblemOnahs) : [];
        singleDay.occasions = appData && appData.UserOccasions ?
            UserOccasion.getOccasionsForDate(singleDay.day, appData.UserOccasions) : [];
        singleDay.entries = appData && appData.Settings.showEntryFlagOnHome ?
            appData.EntryList.list.filter(e => e.date.Abs === singleDay.day.Abs) : [];
        return singleDay;
    }
    renderDay(singleDay) {
        const { day, probs, occasions, entries } = singleDay;
        return (<SingleDayDisplay
            key={day.Abs}
            jdate={day}
            location={this.state.currLocation || Location.getJerusalem()}
            problems={probs}
            occasions={occasions}
            entries={entries}
            isToday={HomeScreen.today.Abs === day.Abs}
            appData={this.state.appData}
            navigate={this.navigate}
            onUpdate={this.updateAppData.bind(this)} />);
    }
    render() {
        const params = {
            appData: this.state.appData,
            onUpdate: this.updateAppData.bind(this)
        },
            menuList = [
                {
                    title: 'Settings',
                    icon: 'settings',
                    onPress: () => this.navigate('Settings', params)
                },
                {
                    title: 'Occasions',
                    icon: 'event',
                    onPress: () => this.navigate('Occasions', params)
                },
                {
                    title: 'Kavuahs',
                    icon: 'device-hub',
                    onPress: () => this.navigate('Kavuahs', params)
                },
                {
                    title: 'Entries',
                    icon: 'list',
                    onPress: () => this.navigate('Entries',
                        {
                            appData: this.state.appData,
                            currLocation: this.state.currLocation || Location.getJerusalem(),
                            onUpdate: this.updateAppData.bind(this)
                        })
                },
                {
                    title: 'Dates',
                    icon: 'flag',
                    onPress: () => this.navigate('FlaggedDates', params)
                }

            ];
        return (
            <ScrollView style={{ flex: 1 }}>
                <View>
                    <Carousel
                        ref={carousel => this._carousel = carousel}
                        pageWidth={width - 40}
                        sneak={20}
                        swipeThreshold={0.2}
                        initialPage={1}
                        currentPage={this.state.pageNumber}
                        onPageChange={this.onDayChanged.bind(this)}>
                        {this.state.daysList.map(day =>
                            this.renderDay(day)
                        )}
                    </Carousel>
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