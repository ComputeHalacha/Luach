import React from 'react';
import { AppState, FlatList, View } from 'react-native';
import SingleDayDisplay from './SingleDayDisplay';
import Login from './Login';
import Flash from './Flash';
import SideMenu from './SideMenu';
import { isLargeScreen, log, goHomeToday } from '../Code/GeneralUtils';
import jDate from '../Code/JCal/jDate';
import AppData from '../Code/Data/AppData';


export default class HomeScreen extends React.Component {
    static navigationOptions = () => ({
        header: null
    });

    constructor(props) {
        super(props);

        this.navigator = props.navigation;

        this.onLoggedIn = this.onLoggedIn.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this._addDaysToEnd = this._addDaysToEnd.bind(this);
        this.getDaysList = this.getDaysList.bind(this);
        this.updateAppData = this.updateAppData.bind(this);
        this._navigatedShowing = this._navigatedShowing.bind(this);
        this.prevDay = this.prevDay.bind(this);
        this.nextDay = this.nextDay.bind(this);
        this.goToday = this.goToday.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);

        //If this screen was navigated to from another screen.
        if (props.navigation && props.navigation.state && props.navigation.state.params) {
            this._navigatedShowing(props.navigation.state.params);
        }
        //We are on the initial showing of the app. We will load the appData from the database.
        else {
            this._initialShowing();
        }
    }
    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);

        //Every minute, we check if the current day has changed
        this.checkToday = setInterval(() => {
            const today = new jDate();
            if ((!this.state.today) || this.state.today.Abs !== today.Abs) {
                this.setState({ today: today });
            }
        }, 60000);
    }
    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
        if (this.checkToday) {
            clearInterval(this.checkToday);
        }
        if (this.flashTimeout) {
            clearTimeout(this.flashTimeout);
        }
    }
    componentWillUpdate(nextProps, nextState) {
        const prevAppData = this.state.appData,
            newAppData = nextState.appData;
        if (!(prevAppData || newAppData)) {
            log('REFRESHED :( - either new appdata or old appdata was nuthin`');
            return true;
        }
        if (!prevAppData.Settings.isSameSettings(newAppData.Settings)) {
            log('REFRESHED :( - Settings were not the same');
            return true;
        }
        if (prevAppData.UserOccasions.length !== newAppData.UserOccasions.length) {
            log('REFRESHED :( - User Occasions list were not the same length');
            return true;
        }
        if (!prevAppData.UserOccasions.every(uo =>
            newAppData.UserOccasions.some(uon => uon.isSameOccasion(uo)))) {
            log('REFRESHED :( - Occasions were not all the same');
            return true;
        }
        if (prevAppData.EntryList.list.length !== newAppData.EntryList.list.length) {
            log('REFRESHED :( - Entries list were not the same length');
            return true;
        }
        if (!prevAppData.EntryList.list.every(e =>
            newAppData.EntryList.list.some(en => en.isSameEntry(e)))) {
            log('REFRESHED :( - Entries were not all the same');
            return true;
        }
        if (prevAppData.KavuahList.length !== newAppData.KavuahList.length) {
            log('REFRESHED :( - Kavuah list were not the same length');
            return true;
        }
        if (!prevAppData.KavuahList.every(k =>
            newAppData.KavuahList.some(kn => kn.isMatchingKavuah(k)))) {
            log('REFRESHED :( - Kavuahs were not all the same');
            return true;
        }
        if (prevAppData.ProblemOnahs.length !== newAppData.ProblemOnahs.length) {
            log('REFRESHED :( - Probs list were not the same length');
            return true;
        }
        if (!prevAppData.ProblemOnahs.every(po =>
            newAppData.ProblemOnahs.some(pon => pon.isSameProb(po)))) {
            log('REFRESHED :( - Probs were not all the same');
            return true;
        }
        log('Home Screen Refresh prevented');
        return false;
    }
    _handleAppStateChange = (nextAppState) => {
        const appData = this.state.appData;
        if (nextAppState === 'active' &&
            appData &&
            appData.Settings &&
            appData.Settings.requirePIN &&
            appData.Settings.PIN.length === 4) {
            this.setState({ showLogin: true });
        }
    }
    /**
    * Recalculates each days data (such as occasions and problem onahs) for the state AppData object.
    * This should be done after updating settings, occasions, entries or kavuahs.
    */
    updateAppData(appData) {
        //As the data has been changed, we need to recalculate the problem onahs.
        const newProbs = appData.EntryList.getProblemOnahs(appData.KavuahList);
        appData.ProblemOnahs = newProbs;
        this.setState({ appData: appData });
    }
    _initialShowing() {
        const today = new jDate();
        AppData.upgradeDatabase();

        const appData = new AppData(),
            daysList = this.getDaysList(today);

        //As we will be going to the database which takes some time, we set initial values for the state.
        this.state = {
            daysList: daysList,
            appData: appData,
            today: today,
            currDate: today,
            showFlash: true,
            refreshing: false
        };

        //Get the data from the database
        AppData.getAppData().then(ad => {
            if (!ad.Settings.requirePIN) {
                this.setFlash();
            }
            this.setState({
                appData: ad,
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
            daysList: this.getDaysList(currDate),
            currDate: currDate,
            today: today,
            showFlash: false,
            showLogin: false,
            loadingDone: true,
            refreshing: false
        };
    }
    setFlash() {
        if (this.state.showFlash) {
            this.flashTimeout = setTimeout(() =>
                this.setState({ showFlash: false })
                , 2500);
        }
    }
    onLoggedIn() {
        this.setState({ showLogin: false });
        this.setFlash();
    }
    scrollToTop() {
        //scrollToOffset may not scroll all the way to the top without the setTimeout.
        setTimeout(() => this.flatList.scrollToOffset({ x: 0, y: 0, animated: true }), 1);
    }
    _goToDate(jdate) {
        if (this.state.daysList > 6 && jdate.Abs === this.state.today.Abs) {
            goHomeToday(this.navigator, this.state.appData);
        }
        else if (jdate.Abs !== this.state.currDate.Abs) {
            this.setState({
                daysList: this.getDaysList(jdate),
                currDate: jdate,
                refreshing: false
            }, this.scrollToTop);
        }
        else {
            this.scrollToTop();
        }
    }
    _addDaysToEnd() {
        const daysList = this.state.daysList,
            day = daysList[daysList.length - 1].addDays(1);
        daysList.push(day);
        this.setState({
            daysList: daysList
        });
    }
    prevDay() {
        this.setState({ refreshing: true });
        this._goToDate(this.state.currDate.addDays(-1));
    }
    nextDay() {
        this._goToDate(this.state.currDate.addDays(1));
    }
    goToday() {
        this._goToDate(this.state.today);
    }
    getDaysList(jdate) {
        const daysList = [jdate];
        daysList.push(jdate.addDays(1));
        daysList.push(jdate.addDays(2));
        if (isLargeScreen()) {
            daysList.push(jdate.addDays(3));
        }
        return daysList;
    }
    /**
     * Render a single day
     * @param {{item:jDate}} param0 item will be a single jDate
     */
    renderItem({ item }) {
        return <SingleDayDisplay
            key={item.Abs}
            jdate={item}
            isToday={this.state.today.Abs === item.Abs}
            appData={this.state.appData}
            navigator={this.navigator}
            onUpdate={this.updateAppData} />;
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                {(this.state.showLogin &&
                    <Login onLoggedIn={this.onLoggedIn} pin={this.state.appData.Settings.PIN} />)
                    ||
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <SideMenu
                                onUpdate={this.updateAppData}
                                appData={this.state.appData}
                                navigator={this.props.navigation}
                                currDate={this.state.currDate}
                                isDataLoading={!this.state.loadingDone}
                                onGoToday={this.goToday}
                                onGoPrevious={this.prevDay}
                                onGoNext={this.nextDay} />
                            <FlatList
                                ref={flatList => this.flatList = flatList}
                                style={{ flex: 1 }}
                                data={this.state.daysList}
                                renderItem={this.renderItem}
                                keyExtractor={item => this.state.daysList.indexOf(item)}
                                onEndReached={this._addDaysToEnd}
                                onRefresh={this.prevDay}
                                refreshing={this.state.refreshing} />
                        </View>
                        {this.state.showFlash &&
                            <Flash />
                        }
                    </View>
                }
            </View>);
    }
}