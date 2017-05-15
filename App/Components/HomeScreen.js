import React from 'react';
import { AppState, StyleSheet, FlatList, Text, View, TouchableHighlight, Image, Modal, TextInput, BackHandler } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { Icon } from 'react-native-elements';
import { isSmallScreen } from '../Code/GeneralUtils';
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
            backgroundColor: '#eef',
            borderTopWidth: 2,
            borderColor: '#99a',
            padding: 15,
            flex: 0
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{
                    fontSize: 25,
                    color: '#909ACF',
                    fontWeight: 'bold'
                }}>Luach</Text>
                <Image
                    style={{ width: 20, height: 20, marginLeft: 5 }}
                    resizeMode='stretch'
                    source={require('../Images/logo.png')} />
            </View>
            <View style={{ flexDirection: isSmallScreen ? 'row' : 'column' }}>
                <Text style={{
                    fontSize: 11,
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
        this.setDayInformation = this.setDayInformation.bind(this);
        this.getDaysList = this.getDaysList.bind(this);
        this.updateAppData = this.updateAppData.bind(this);
        this._navigatedShowing = this._navigatedShowing.bind(this);
        this.prevDay = this.prevDay.bind(this);
        this.goToday = this.goToday.bind(this);
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);

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
            showFlash: true,
            menuWidth: 50
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
            loadingDone: true,
            menuWidth: 50
        };
    }
    setFlash() {
        if (this.state.showFlash) {
            setTimeout(() =>
                this.setState({ showFlash: false })
                , 2500);
        }
    }
    loginAttempt(pin) {
        if (pin === this.state.appData.Settings.PIN) {
            this.setState({ showLogin: false });
            this.setFlash();
        }
    }
    _goToDate(jdate, isToday) {
        if (jdate !== this.state.currDate) {
            const today = isToday ? jdate : this.state.today;
            this.setState({
                daysList: this.getDaysList(jdate),
                currDate: jdate,
                today: today,
                pageNumber: 1
            });
        }
        this.flatList.scrollToOffset({ x: 0, y: 0, animated: true });
    }
    _addDaysToEnd() {
        const daysList = this.state.daysList,
            day = daysList[daysList.length - 1].day.addDays(1);
        daysList.push(this.setDayInformation({ day }));
        this.setState({
            daysList: daysList
        });
    }
    prevDay() {
        this._goToDate(this.state.currDate.addDays(-1));
    }
    goToday() {
        this._goToDate(this.state.today, true);
    }
    getDaysList(jdate, appData) {
        appData = appData || this.state.appData;
        const daysList = [this.setDayInformation({ day: jdate }, appData)];
        daysList.push(this.setDayInformation({ day: jdate.addDays(1) }, appData));
        daysList.push(this.setDayInformation({ day: jdate.addDays(2) }, appData));

        return daysList;
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
    hideMenu() {
        this.setState({ menuWidth: 0 });
    }
    showMenu() {
        this.setState({ menuWidth: 50 });
    }
    renderItem({ item }) {
        const { day, hasProbs, occasions, entries } = item;
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
        const params = {
            appData: this.state.appData,
            onUpdate: this.updateAppData
        };
        return (
            <View style={{ flex: 1 }}>
                {(this.state.showLogin &&
                    <Login onLoginAttempt={this.loginAttempt} />)
                    ||
                    <View style={{ flex: 1 }}>
                        <GestureRecognizer style={{ flexDirection: 'row', flex: 1 }}
                            onSwipeLeft={this.hideMenu}
                            onSwipeRight={this.showMenu}>
                            <View style={{ width: this.state.menuWidth, height: '100%', flex: 0, borderRightWidth: 1, borderColor: '#777', padding: 0, margin: 0 }}>
                                <TouchableHighlight underlayColor='#eef' onPress={() => this.navigate('MonthView',
                                    { ...params, jdate: this.state.currDate })} style={styles.sideButton}>
                                    <View style={styles.menuView}>
                                        <Icon iconStyle={styles.menuIcon} name='calendar' type='octicon' />
                                        <Text style={styles.menuText}>Month</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight style={styles.sideButton} underlayColor='#eef' onPress={this.prevDay}>
                                    <View style={styles.menuView}>
                                        <Text style={styles.menuText}>Previous Day</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight underlayColor='#eef' onPress={this.goToday} style={styles.sideButton}>
                                    <View style={styles.menuView}>
                                        <Text style={styles.menuText}>Today</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight style={styles.sideButton} underlayColor='#eef' onPress={() => { if (this.state.loadingDone) this.navigate('FlaggedDates', params); }}>
                                    <View style={styles.menuView}>
                                        <Icon iconStyle={styles.menuIcon} name='flag' />
                                        <Text style={styles.menuText}>Dates</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight style={styles.sideButton} underlayColor='#eef' onPress={() => {
                                    if (this.state.loadingDone) this.navigate('Entries',
                                        {
                                            appData: this.state.appData,
                                            currLocation: this.state.currLocation || Location.getJerusalem(),
                                            onUpdate: this.updateAppData
                                        });
                                }}>
                                    <View style={styles.menuView}>
                                        <Icon iconStyle={styles.menuIcon} name='list' />
                                        <Text style={styles.menuText}>Entries</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight style={styles.sideButton} underlayColor='#eef' onPress={() => { if (this.state.loadingDone) this.navigate('Kavuahs', params); }}>
                                    <View style={styles.menuView}>
                                        <Icon iconStyle={styles.menuIcon} name='device-hub' />
                                        <Text style={styles.menuText}>Kavuahs</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight style={styles.sideButton} underlayColor='#eef' onPress={() => { if (this.state.loadingDone) this.navigate('Occasions', params); }}>
                                    <View style={styles.menuView}>
                                        <Icon iconStyle={styles.menuIcon} name='event' />
                                        <Text style={styles.menuText}>Events</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight style={styles.sideButton} underlayColor='#eef' onPress={() => { if (this.state.loadingDone) this.navigate('Settings', params); }}>
                                    <View style={styles.menuView}>
                                        <Icon iconStyle={styles.menuIcon} name='settings' />
                                        <Text style={styles.menuText}>Settings</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>
                            <FlatList
                                ref={flatList => this.flatList = flatList}
                                style={{ flex: 1 }}
                                data={this.state.daysList}
                                renderItem={this.renderItem}
                                keyExtractor={item => this.state.daysList.indexOf(item)}
                                onEndReached={this._addDaysToEnd} />
                        </GestureRecognizer>
                        {this.state.showFlash &&
                            <Flash />
                        }
                    </View>
                }
            </View>);
    }
}

const styles = StyleSheet.create({
    sideButton: {
        flex: 1
    },
    menuView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderColor: '#888',
        backgroundColor: '#666',
        paddingTop: 5,
        paddingBottom: 5,
        width: '100%'
    },
    menuText: {
        fontSize: 10,
        color: '#eee',
        textAlign: 'center',
        flexWrap: 'wrap'
    },
    menuIcon: {
        fontSize: 20,
        color: '#eee'
    }
});