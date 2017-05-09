import React from 'react';
import { Dimensions, StyleSheet, Text, View, ScrollView, TouchableHighlight, Image } from 'react-native';
import { List, ListItem, Icon } from 'react-native-elements';
import Carousel from './Carousel/Carousel';
import SingleDayDisplay from './SingleDayDisplay';
import jDate from '../Code/JCal/jDate';
import Location from '../Code/JCal/Location';
import AppData from '../Code/Data/AppData';
import { UserOccasion } from '../Code/JCal/UserOccasion';

export default class HomeScreen extends React.Component {
    static navigationOptions = () => ({
        title: 'Luach',
        permalink: '',
        header: null
    });
    static screenWidth = Dimensions.get('window').width;
    static today = new jDate();

    constructor(props) {
        super(props);

        this.navigate = props.navigation.navigate;

        this.renderItem = this.renderItem.bind(this);
        this._addDaysToEnd = this._addDaysToEnd.bind(this);
        this._addDaysToBeginning = this._addDaysToBeginning.bind(this);
        this.setDayInformation = this.setDayInformation.bind(this);
        this.getDaysList = this.getDaysList.bind(this);
        this.onDayChanged = this.onDayChanged.bind(this);
        this.updateAppData = this.updateAppData.bind(this);
        this._navigatedShowing = this._navigatedShowing.bind(this);
        this.prevDay = this.prevDay.bind(this);
        this.prevMonth = this.prevMonth.bind(this);
        this.prevYear = this.prevYear.bind(this);
        this.goToday = this.goToday.bind(this);
        this.nextDay = this.nextDay.bind(this);
        this.nextMonth = this.nextMonth.bind(this);
        this.nextYear = this.nextYear.bind(this);

        //If this screen was navigated to from another screen.
        if (props.navigation.state && props.navigation.state.params) {
            this._navigatedShowing(props.navigation.state.params);
        }
        //We are on the initial showing of the app. We will load the appData from the database.
        else {
            this._initialShowing();
        }

        setTimeout(() =>
            this.setState({ showFlash: false })
            , 5000);
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
            pageNumber: 1,
            showFlash: true
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
                currLocation: ad.Settings.location,
                loadingDone: true
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
            pageNumber: 1,
            showFlash: false,
            loadingDone: true
        };
    }
    _goToDate(jdate) {
        this.setState({
            daysList: this.getDaysList(jdate),
            currDate: jdate,
            pageNumber: 1
        });
    }
    _addDaysToEnd(position) {
        const daysList = this.state.daysList,
            day = daysList[daysList.length - 1].day.addDays(1);
        daysList.push(this.setDayInformation({ day }));
        this.setState({
            daysList: daysList,
            pageNumber: position,
            currDate: daysList[daysList.length - 1].day,
        });
    }
    _addDaysToBeginning() {
        const daysList = this.state.daysList,
            day = daysList[0].day.addDays(-1);
        daysList.unshift(this.setDayInformation({ day }));
        this.setState({
            daysList: daysList,
            pageNumber: 1,
            currDate: daysList[1].day
        });
    }
    prevDay() {
        this._addDaysToBeginning();
    }
    prevMonth() {
        this._goToDate(this.state.appData.Settings.navigateBySecularDate ?
            this.state.currDate.addSecularMonths(-1) : this.state.currDate.addMonths(-1));
    }
    prevYear() {
        this._goToDate(this.state.appData.Settings.navigateBySecularDate ?
            this.state.currDate.addSecularYears(-1) : this.state.currDate.addYears(-1));
    }
    goToday() {
        this._goToDate(HomeScreen.today);
    }
    nextDay() {
        this._addDaysToEnd(this.state.pageNumber + 1);
    }
    nextMonth() {
        this._goToDate(this.state.appData.Settings.navigateBySecularDate ?
            this.state.currDate.addSecularMonths(1) : this.state.currDate.addMonths(1));
    }
    nextYear() {
        this._goToDate(this.state.appData.Settings.navigateBySecularDate ?
            this.state.currDate.addSecularYears(1) : this.state.currDate.addYears(1));
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

        singleDay.hasProbs = appData && appData.ProblemOnahs && appData.Settings.showProbFlagOnHome &&
            !!appData.ProblemOnahs.find(po => po.jdate.Abs === singleDay.day.Abs);
        singleDay.occasions = appData && appData.UserOccasions ?
            UserOccasion.getOccasionsForDate(singleDay.day, appData.UserOccasions) : [];
        singleDay.entries = appData && appData.Settings.showEntryFlagOnHome ?
            appData.EntryList.list.filter(e => e.date.Abs === singleDay.day.Abs) : [];
        return singleDay;
    }
    renderItem(singleDay) {
        const { day, hasProbs, occasions, entries } = singleDay;
        return (<SingleDayDisplay
            key={day.Abs}
            jdate={day}
            location={this.state.currLocation || Location.getJerusalem()}
            flag={hasProbs}
            occasions={occasions}
            entries={entries}
            isToday={HomeScreen.today.Abs === day.Abs}
            appData={this.state.appData}
            navigate={this.navigate}
            onUpdate={this.updateAppData} />);
    }
    render() {
        const params = {
            appData: this.state.appData,
            onUpdate: this.updateAppData
        },
            menuList = [
                {
                    title: 'Settings',
                    icon: 'settings',
                    onPress: () => { if (this.state.loadingDone) this.navigate('Settings', params) }
                },
                {
                    title: 'Occasions',
                    icon: 'event',
                    onPress: () => { if (this.state.loadingDone) this.navigate('Occasions', params) }
                },
                {
                    title: 'Kavuahs',
                    icon: 'device-hub',
                    onPress: () => { if (this.state.loadingDone) this.navigate('Kavuahs', params) }
                },
                {
                    title: 'Entries',
                    icon: 'list',
                    onPress: () => {
                        if (this.state.loadingDone) this.navigate('Entries',
                            {
                                appData: this.state.appData,
                                currLocation: this.state.currLocation || Location.getJerusalem(),
                                onUpdate: this.updateAppData
                            })
                    }
                },
                {
                    title: 'Dates',
                    icon: 'flag',
                    onPress: () => { if (this.state.loadingDone) this.navigate('FlaggedDates', params) }
                }

            ];
        return (
            <ScrollView style={{ flex: 1 }}>
                {this.state.showFlash &&
                    <View>
                        <View style={{
                            backgroundColor: '#d5d5e6',
                            padding: 10,
                            flex: 1
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{
                                    fontSize: 35,
                                    color: '#909ACF',
                                    fontWeight: 'bold'
                                }}>Luach</Text>
                                <Image
                                    style={{ width: 30, height: 30, marginLeft: 5 }}
                                    resizeMode='stretch'
                                    source={require('../Images/logo.png')} />
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{
                                    fontSize: 13,
                                    color: '#a66',
                                    fontWeight: 'bold'
                                }}>PLEASE NOTE:<Text
                                    style={{ fontWeight: 'normal' }}> DO NOT rely exclusivley upon this application</Text></Text>
                            </View>
                        </View>
                    </View>
                }
                <View>
                    <Carousel
                        pageWidth={HomeScreen.screenWidth - 40}
                        sneak={20}
                        swipeThreshold={0.2}
                        initialPage={1}
                        currentPage={this.state.pageNumber}
                        onPageChange={this.onDayChanged}>
                        {this.state.daysList.map(day =>
                            this.renderItem(day)
                        )}
                    </Carousel>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <TouchableHighlight underlayColor='#eef' onPress={this.prevYear}>
                            <View style={styles.navView}>
                                <Icon iconStyle={styles.navIcon} name='navigate-before' />
                                <Text style={styles.navText}>Year</Text>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor='#eef' onPress={this.prevMonth}>
                            <View style={styles.navView}>
                                <Icon iconStyle={styles.navIcon} name='navigate-before' />
                                <Text style={styles.navText}>Month</Text>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor='#eef' onPress={this.prevDay}>
                            <View style={styles.navView}>
                                <Icon iconStyle={styles.navIcon} name='navigate-before' />
                                <Text style={styles.navText}>Day</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                    <TouchableHighlight underlayColor='#eef' onPress={this.goToday}>
                        <View style={styles.navCenterView}>
                            {(this.state.currDate.Abs !== HomeScreen.today.Abs &&
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon iconStyle={styles.navIcon} name='navigate-before' />
                                    <Text style={{ color: '#565', fontSize: 13, fontWeight: 'bold' }}>TODAY</Text>
                                    <Icon iconStyle={styles.navIcon} name='navigate-next' />
                                </View>)
                                ||
                                (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image style={{ width: 15, height: 15, marginRight: 4 }} resizeMode='stretch' source={require('../Images/logo.png')} />
                                        <Text style={{ color: '#556', fontSize: 15, fontWeight: 'bold' }}>Luach</Text>
                                    </View>
                                )
                            }
                        </View>
                    </TouchableHighlight>
                    <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                        <TouchableHighlight underlayColor='#eef' onPress={this.nextYear}>
                            <View style={styles.navView}>
                                <Text style={styles.navText}>Year</Text>
                                <Icon iconStyle={styles.navIcon} name='navigate-next' />
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor='#eef' onPress={this.nextMonth}>
                            <View style={styles.navView}>
                                <Text style={styles.navText}>Month</Text>
                                <Icon iconStyle={styles.navIcon} name='navigate-next' />
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor='#eef' onPress={this.nextDay}>
                            <View style={styles.navView}>
                                <Text style={styles.navText}>Day</Text>
                                <Icon iconStyle={styles.navIcon} name='navigate-next' />
                            </View>
                        </TouchableHighlight>
                    </View>
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
            </ScrollView>);
    }
}

const styles = StyleSheet.create({
    navView: {
        flex: 0,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 3,
        paddingRight: 3,
        margin: 2,
        borderRadius: 3,
        flexDirection: 'row',
        backgroundColor: '#f6f6ff'
    },
    navCenterView: {
        flex: 2,
        flexDirection: 'row'
    },
    navText: {
        fontSize: 14,
        color: '#88c'
    },
    navIcon: {
        fontSize: 11
    }
});