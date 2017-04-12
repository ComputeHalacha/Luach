import React from 'react';
import { Dimensions, StyleSheet, Text, View, ScrollView } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import Carousel from './Carousel/Carousel';
import SingleDayDisplay from './SingleDayDisplay';
import jDate from '../Code/JCal/jDate';
import Location from '../Code/JCal/Location';
import AppData from '../Code/Data/AppData';
import ProblemOnahs from '../Code/Chashavshavon/ProblemOnah';
import { UserOccasionType, UserOccasion } from '../Code/JCal/UserOccasion';

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
        const daysList = [
            { day: HomeScreen.today.addDays(-1), probs: [], occasions: [] },
            { day: HomeScreen.today, probs: [], occasions: [] },
            { day: HomeScreen.today.addDays(1), probs: [], occasions: [] }];
        this.state = {
            daysList: daysList,
            appData: null,
            currDate: HomeScreen.today,
            currLocation: null,
            pageNumber: 1
        };
        AppData.getAppData().then(ad => {
            const allOccasions = ad.UserOccasions;
            for (let day of daysList) {
                day.occasions = UserOccasion.getOccasionsForDate(day.day, allOccasions);
            }
            this.setState({
                appData: ad,
                daysList: daysList,
                currLocation: ad.Settings.location
            });
        });
        this.navigate = this.props.navigation.navigate;
    }
    /**
    * Recalculates each days data (such as occasions and problem onahs) for the state AppData object.
    * This should be done after updating settings, occasions, entries or kavuahs.
    */
    updateAppData(newSettings) {
        const ad = this.state.appData;

        if (newSettings) {
            ad.Settings = newSettings;
        }

        //Now that the data has been changed, we need to recalculate the problem onahs.
        const elist = ad.EntryList,
            klist = ad.KavuahList,
            probs = elist.getProblemOnahs(klist);
        ad.ProblemOnahs = probs;

        //In case the problems or occasions have been changed, we need to update the days list
        const daysList = this.state.daysList,
            allProbs = this.state.appData.ProblemOnahs,
            allOccasions = this.state.appData.UserOccasions;
        for (let day of daysList) {
            day.probs = ProblemOnahs.getProbsForDate(day.day, allProbs);
            day.occasions = UserOccasion.getOccasionsForDate(day.day, allOccasions);
        }

        this.setState({
            appData: ad,
            currLocation: newSettings.location,
            daysList: daysList
        });
    }
    onDayChanged(i) {
        if (i === this.state.daysList.length - 1) {
            this._addDaysToEnd(i);
        }
        else if (i === 0) {
            this._addDaysToBeginning();
        }
    }
    _addDaysToEnd(pageNum) {
        const daysList = this.state.daysList,
            day = daysList[daysList.length - 1].day.addDays(1);
        daysList.push({
            day,
            probs: ProblemOnahs.getProbsForDate(day, this.state.appData && this.state.appData.ProblemOnahs)
        });
        this.setState({
            daysList: daysList,
            pageNumber: pageNum
        });
    }
    _addDaysToBeginning() {
        const daysList = this.state.daysList,
            day = daysList[0].day.addDays(-1);
        daysList.unshift({
            day,
            probs: ProblemOnahs.getProbsForDate(day, this.state.appData && this.state.appData.ProblemOnahs)
        });
        this.setState({
            daysList: daysList,
            pageNumber: 1
        });
    }
    renderDay(singleDay) {
        const { day, probs, occasions } = singleDay;
        return (<SingleDayDisplay
            key={day.Abs}
            jdate={day}
            location={this.state.currLocation || Location.getJerusalem()}
            problems={probs}
            occasions={occasions}
            isToday={HomeScreen.today.Abs === day.Abs}
            appData={this.state.appData}
            navigate={this.navigate} />);
    }
    render() {
        const menuList = [
            {
                title: 'Settings',
                icon: 'settings',
                onPress: () => this.navigate('Settings',
                    {
                        appData: this.state.appData,
                        onUpdate: this.updateAppData.bind(this)
                    })
            },
            {
                title: 'Kavuahs',
                icon: 'device-hub',
                onPress: () => this.navigate('Kavuahs', { appData: this.state.appData })
            },
            {
                title: 'Entries',
                icon: 'list',
                onPress: () => this.navigate('Entries',
                    {
                        appData: this.state.appData,
                        currLocation: this.state.currLocation || Location.getJerusalem()
                    })
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