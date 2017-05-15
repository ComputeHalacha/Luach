import React from 'react';
import { AppState, StyleSheet, Text, View, ScrollView, TouchableHighlight, Image, Modal, TextInput, BackHandler } from 'react-native';
import { List, ListItem, Icon } from 'react-native-elements';
import { getScreenWidth, isSmallScreen } from '../Code/GeneralUtils';
import Carousel from './Carousel/Carousel';
import SingleDayDisplay from './SingleDayDisplay';
import jDate from '../Code/JCal/jDate';
import Location from '../Code/JCal/Location';
import AppData from '../Code/Data/AppData';
import { UserOccasion } from '../Code/JCal/UserOccasion';

const Login = props =>
    <Modal onRequestClose={() => BackHandler.exitApp()}>
        <View style={{ flex: 1, backgroundColor: '#444', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#eef', flex: 0, width: '75%', borderWidth: 1, borderRadius: 6, padding: 15, alignItems: 'center', marginTop: '10%' }}>
                <Image style={{ width: 50, height: 50 }} resizeMode='stretch' source={require('../Images/logo.png')} />
                <Text style={{ color: '#556', fontSize: 35, fontWeight: 'bold', paddingBottom: 20 }}>Luach</Text>
                <Text>Please enter your 4 digit PIN</Text>
                <TextInput
                    style={{ width: 150, fontSize: 20, textAlign: 'center' }}
                    keyboardType='numeric'
                    returnKeyType='next'
                    maxLength={4}
                    onChangeText={value => props.onLoginAttempt(value)}
                    autoFocus={true}
                    secureTextEntry={true}
                    iosclearTextOnFocus={true} />
            </View>
        </View>
    </Modal>,
    Flash = () =>
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
        </View>;

export class HomeScreen extends React.Component {
    static navigationOptions = () => ({
        title: 'Luach',
        permalink: '',
        header: null
    });

    constructor(props) {
        super(props);

        this.navigate = props.navigation.navigate;

        this.loginAttempt = this.loginAttempt.bind(this);
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
        this.getMenuList = this.getMenuList.bind(this);

        //If this screen was navigated to from another screen.
        if (props.navigation.state && props.navigation.state.params) {
            this._navigatedShowing(props.navigation.state.params);
        }
        //We are on the initial showing of the app. We will load the appData from the database.
        else {
            this._initialShowing();
        }
        //In case the day changed while the app was open
        setInterval(() => {
            const today = new jDate();
            if (this.state.today.Abs !== today.Abs) {
                this._goToDate(today, true);
            }
        }, 30000);
    }
    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
    }
    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }
    _handleAppStateChange = (nextAppState) => {
        const appData = this.state.appData;
        if (appData && appData.Settings.requirePIN && nextAppState === 'active') {
            this.setState({ showLogin: true });
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
        const today = new jDate();
        AppData.upgradeDatabase();

        const appData = new AppData(),
            daysList = this.getDaysList(today, appData);

        //As we will be going to the database which takes some time, we set initial values for the state.
        this.state = {
            daysList: daysList,
            appData: appData,
            today: today,
            currDate: today,
            currLocation: Location.getJerusalem(),
            pageNumber: 1,
            showFlash: true
        };

        //Get the data from the database
        AppData.getAppData().then(ad => {
            if (!ad.Settings.requirePIN) {
                this.setFlash();
            }

            //Set each days props - such as entries, occasions and probs.
            for (let singleDay of daysList) {
                this.setDayInformation(singleDay, ad);
            }
            this.setState({
                appData: ad,
                daysList: daysList,
                currLocation: ad.Settings.location,
                loadingDone: true,
                showLogin: ad.Settings.requirePIN
            });
        });
    }
    _navigatedShowing(params) {
        //As this screen was navigated to from another screen, we will use the original appData.
        //We also allow another screen to naviate to any date by supplying a currDate property in the navigate props.
        const today = new jDate(),
            appData = params.appData,
            currDate = params.currDate || today;
        //We don't need to use setState here as this function is only called from the constructor.
        this.state = {
            appData: appData,
            daysList: this.getDaysList(currDate, appData),
            currDate: currDate,
            today: today,
            currLocation: appData.Settings.location,
            pageNumber: 1,
            showFlash: false,
            loadingDone: true
        };
    }
    setFlash() {
        setTimeout(() =>
            this.setState({ showFlash: false })
            , 3000);
    }
    loginAttempt(pin) {
        if (pin === this.state.appData.Settings.PIN) {
            this.setState({ showLogin: false });
            this.setFlash();
        }
    }
    _goToDate(jdate, isToday) {
        const today = isToday ? jdate : this.state.today;
        this.setState({
            daysList: this.getDaysList(jdate),
            currDate: jdate,
            today: today,
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
        this._goToDate(this.state.currDate.addDays(-1));
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
        this._goToDate(this.state.today, true);
    }
    nextDay() {
        this._goToDate(this.state.currDate.addDays(1));
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
        appData = appData || this.state.appData;
        const daysList = [this.setDayInformation({ day: jdate.addDays(-1) }, appData)];
        daysList.push(this.setDayInformation({ day: jdate }, appData));
        daysList.push(this.setDayInformation({ day: jdate.addDays(1) }, appData));

        return daysList;
    }
    getMenuList() {
        const params = {
            appData: this.state.appData,
            onUpdate: this.updateAppData
        },
            menuList = [
                {
                    title: 'Settings',
                    icon: 'settings',
                    onPress: () => { if (this.state.loadingDone) this.navigate('Settings', params); }
                },
                {
                    title: 'Occasions',
                    icon: 'event',
                    onPress: () => { if (this.state.loadingDone) this.navigate('Occasions', params); }
                },
                {
                    title: 'Kavuahs',
                    icon: 'device-hub',
                    onPress: () => { if (this.state.loadingDone) this.navigate('Kavuahs', params); }
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
                            });
                    }
                },
                {
                    title: 'Dates',
                    icon: 'flag',
                    onPress: () => { if (this.state.loadingDone) this.navigate('FlaggedDates', params); }
                }
            ];
        if (isSmallScreen()) {
            menuList.unshift({
                title: 'Go To Today',
                icon: 'view-carousel',
                onPress: () => this.goToday()
            });
        }
        return menuList;
    }
    setDayInformation(singleDay, appData) {
        appData = appData || (this.state && this.state.appData);

        if (appData) {
            singleDay.hasProbs = appData.Settings.showProbFlagOnHome &&
                appData.ProblemOnahs.some(po => po.jdate.Abs === singleDay.day.Abs);
            singleDay.occasions = appData.UserOccasions.length > 0 ?
                UserOccasion.getOccasionsForDate(singleDay.day, appData.UserOccasions) : [];
            singleDay.entries = appData.Settings.showEntryFlagOnHome ?
                appData.EntryList.list.filter(e => e.date.Abs === singleDay.day.Abs) : [];
        }
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
            isToday={this.state.today.Abs === day.Abs}
            appData={this.state.appData}
            navigate={this.navigate}
            onUpdate={this.updateAppData} />);
    }
    render() {
        const menuList = this.getMenuList();
        return (
            <ScrollView style={{ flex: 1 }}>
                {(this.state.showLogin &&
                    <Login onLoginAttempt={this.loginAttempt} />)
                    ||
                    <View>
                        {this.state.showFlash &&
                            <View><Flash /></View>
                        }
                        <View>
                            <Carousel
                                pageWidth={getScreenWidth() - 40}
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
                            {(!isSmallScreen()) &&
                                <TouchableHighlight underlayColor='#eef' onPress={this.goToday}>
                                    <View style={styles.navCenterView}>
                                        {(this.state.currDate.Abs !== this.state.today.Abs &&
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Icon iconStyle={styles.navIcon} name='navigate-before' />
                                                <Text style={{ color: '#565', fontSize: 13, fontWeight: 'bold' }}>TODAY</Text>
                                                <Icon iconStyle={styles.navIcon} name='navigate-next' />
                                            </View>)
                                            ||
                                            (
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Image
                                                        style={{ width: 15, height: 15, marginRight: 4 }}
                                                        resizeMode='stretch'
                                                        source={require('../Images/logo.png')} />
                                                    <Text style={{ color: '#556', fontSize: 15, fontWeight: 'bold' }}>Luach</Text>
                                                </View>
                                            )
                                        }
                                    </View>
                                </TouchableHighlight>
                            }
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
                    </View>
                }
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