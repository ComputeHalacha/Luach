import React from 'react';
import { AppState, FlatList, View } from 'react-native';
import { Icon } from 'react-native-elements';
import SingleDayDisplay from '../Components/SingleDayDisplay';
import Login from '../Components/Login';
import Flash from '../Components/Flash';
import FirstTimeModal from '../Components/FirstTimeModal';
import SideMenu from '../Components/SideMenu';
import {
    isLargeScreen,
    log,
    goHomeToday,
    getTodayJdate,
    GLOBALS,
} from '../../Code/GeneralUtils';
import jDate from '../../Code/JCal/jDate';
import Utils from '../../Code/JCal/Utils';
import AppData from '../../Code/Data/AppData';
import { TaharaEventType } from '../../Code/Chashavshavon/TaharaEvent';

export default class HomeScreen extends React.Component {
    static navigationOptions = ({ navigation }) =>
        //Only IOS gets the header on the today screen.
        GLOBALS.IS_IOS
            ? {
                  title: 'Luach',
                  headerRight: (
                      <Icon
                          name="calendar"
                          type="octicon"
                          color="#77c"
                          onPress={() =>
                              AppData.getAppData().then(ad =>
                                  navigation.navigate('MonthView', {
                                      appData: ad,
                                      jdate: getTodayJdate(ad),
                                  })
                              )
                          }
                      />
                  ),
              }
            : { header: null };

    constructor(props) {
        super(props);

        this.navigator = props.navigation;

        this.onLoggedIn = this.onLoggedIn.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this._addDaysToEnd = this._addDaysToEnd.bind(this);
        this.getDaysList = this.getDaysList.bind(this);
        this.getDayOfSeven = this.getDayOfSeven.bind(this);
        this.updateAppData = this.updateAppData.bind(this);
        this._navigatedShowing = this._navigatedShowing.bind(this);
        this._handleAppStateChange = this._handleAppStateChange.bind(this);
        this.prevDay = this.prevDay.bind(this);
        this.nextDay = this.nextDay.bind(this);
        this.goToday = this.goToday.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
        this.getElemementToShow = this.getElemementsToRender.bind(this);

        //If this screen was navigated to from another screen.
        if (
            props.navigation &&
            props.navigation.state &&
            props.navigation.state.params
        ) {
            this._navigatedShowing(props.navigation.state.params);
        }
        //We are on the initial showing of the app. We will load the appData from the database.
        else {
            this.initialShowing();
        }
    }
    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);

        //Every minute, we check if the current day has changed
        this.checkToday = setInterval(() => {
            let { appData, today, systemDate, daysList, currDate } = this.state;
            //Get the proper Jewish today for the current location
            const nowJ = getTodayJdate(appData),
                nowS = new Date();
            if (
                !Utils.isSameJdate(today, nowJ) ||
                !Utils.isSameSdate(systemDate, nowS)
            ) {
                if (
                    Utils.isSameJdate(currDate, today) &&
                    !Utils.isSameJdate(currDate, nowJ)
                ) {
                    daysList = this.getDaysList(nowJ);
                    currDate = nowJ;
                }
                this.setState({
                    today: nowJ,
                    systemDate: nowS,
                    daysList,
                });
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
        /**
         * We will try to prevent re-rendering if the data was not changed.
         */
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
        if (
            prevAppData.UserOccasions.length !== newAppData.UserOccasions.length
        ) {
            log('REFRESHED :( - User Occasions list were not the same length');
            return true;
        }
        if (
            !prevAppData.UserOccasions.every(uo =>
                newAppData.UserOccasions.some(uon => uon.isSameOccasion(uo))
            )
        ) {
            log('REFRESHED :( - Occasions were not all the same');
            return true;
        }
        if (
            prevAppData.EntryList.list.length !==
            newAppData.EntryList.list.length
        ) {
            log('REFRESHED :( - Entries list were not the same length');
            return true;
        }
        if (
            !prevAppData.EntryList.list.every(e =>
                newAppData.EntryList.list.some(en => en.isSameEntry(e))
            )
        ) {
            log('REFRESHED :( - Entries were not all the same');
            return true;
        }
        if (prevAppData.KavuahList.length !== newAppData.KavuahList.length) {
            log('REFRESHED :( - Kavuah list were not the same length');
            return true;
        }
        if (
            !prevAppData.KavuahList.every(k =>
                newAppData.KavuahList.some(kn => kn.isMatchingKavuah(k))
            )
        ) {
            log('REFRESHED :( - Kavuahs were not all the same');
            return true;
        }
        if (
            prevAppData.ProblemOnahs.length !== newAppData.ProblemOnahs.length
        ) {
            log('REFRESHED :( - Probs list were not the same length');
            return true;
        }
        if (
            !prevAppData.ProblemOnahs.every(po =>
                newAppData.ProblemOnahs.some(pon => pon.isSameProb(po))
            )
        ) {
            log('REFRESHED :( - Probs were not all the same');
            return true;
        }
        if (
            prevAppData.TaharaEvents.length !== newAppData.TaharaEvents.length
        ) {
            log('REFRESHED :( - Tahara Events list were not the same length');
            return true;
        }
        log('Home Screen Refresh prevented');
        return false;
    }
    _handleAppStateChange(nextAppState) {
        log(
            `AppState Change: currentState: "${
                AppState.currentState
            }", nextState: "${nextAppState}"`
        );

        const appData = this.state.appData;
        //If the require PIN setting is on and we are going into background mode,
        //we want to display the login modal upon re-awakening.
        if (
            nextAppState === 'background' &&
            appData &&
            appData.Settings &&
            appData.Settings.requirePIN &&
            appData.Settings.PIN.length === 4
        ) {
            //Next time the app is activated, it will ask for the PIN
            this.setState({ showLogin: true });
        }
    }
    updateAppData(appData) {
        let { currDate, daysList, today } = this.state;
        const lastRegularEntry = appData.EntryList.lastRegularEntry(),
            lastEntry = appData.EntryList.lastEntry(),
            //Were we displaying "Today" before this refresh?
            isToday = Utils.isSameJdate(currDate, today);

        //In case the "Today" changed due to a Settings change etc.
        if (isToday) {
            //Get the proper Jewish today for the current location
            today = getTodayJdate(appData);
            currDate = today;
            //If the previous "today" is not the same date as todays "today",
            // we need to move "today" back up to the top of the list
            if (!Utils.isSameJdate(daysList[0], currDate)) {
                daysList = this.getDaysList(currDate);
            }
        }

        this.setState({
            appData: appData,
            daysList: daysList,
            lastRegularEntry: lastRegularEntry,
            lastEntry: lastEntry,
            today: today,
            currDate: currDate,
            systemDate: new Date(),
        });
    }
    /**
     * This function is called the when the app first initially loads
     */
    async initialShowing() {
        let today = new jDate(),
            daysList = this.getDaysList(today);

        //We start with an empty appData object just to get the render started immediately.
        let appData = new AppData();

        //As we will be going to the database which takes some time, we set initial default values for the state.
        this.state = {
            daysList,
            appData,
            today,
            currDate: today,
            showFlash: true,
            refreshing: false,
            showFirstTimeModal: false,
        };

        //Now that the GUI is showing, we asynchronously get the "real" data from the database
        appData = await AppData.getAppData();

        if (!appData.Settings.requirePIN) {
            this.setFlash();
        }
        const lastRegularEntry = appData.EntryList.lastRegularEntry(),
            lastEntry = appData.EntryList.lastEntry();
        //As we now have a location, the current
        //Jewish date may be different than the system date
        (today = getTodayJdate(appData)),
            (daysList = Utils.isSameJdate(today, this.state.daysList[0])
                ? this.state.daysList
                : this.getDaysList(today));

        //We now will re-render the screen with the real data.
        this.setState({
            appData,
            daysList,
            today,
            systemDate: new Date(),
            currDate: today,
            loadingDone: true,
            showLogin:
                appData.Settings.requirePIN &&
                appData.Settings.PIN &&
                appData.Settings.PIN.length === 4,
            lastEntry,
            lastRegularEntry,
            showFirstTimeModal: !global.IsFirstRun,
        });
        log(`From Main: global.IsFirstRun is set to: ${global.IsFirstRun}`);
    }
    /**
     * When returning to this main screen from another screen, we don't need to go to the database.
     * The global appData object is returned to us in params.appData.
     * The params.currDate contains the jdate that we should show on the top of the screen.
     * @param {{appData:AppData,currDate:jDate}} params
     */
    _navigatedShowing(params) {
        //As this screen was navigated to from another screen, we will use the original appData.
        //We also allow another screen to naviate to any date by supplying a currDate property in the navigate props.
        const appData = params.appData,
            today = getTodayJdate(appData),
            currDate = params.currDate || today,
            lastRegularEntry = appData.EntryList.lastRegularEntry(),
            lastEntry = appData.EntryList.lastEntry();
        //We don't need to use setState here as this function is only ever called before the initial render from the constructor.
        this.state = {
            appData: appData,
            daysList: this.getDaysList(currDate),
            currDate: currDate,
            today: today,
            systemDate: new Date(),
            showFlash: false,
            loadingDone: true,
            refreshing: false,
            lastRegularEntry: lastRegularEntry,
            lastEntry: lastEntry,
        };
    }
    /**
     * Show the "flash" warning banner on the bottom of the screen for 1.5 seconds.
     * If this is the first time Luach has been run, we will show the flash screen for 10 seconds.
     */
    setFlash() {
        if (this.state.showFlash) {
            this.flashTimeout = setTimeout(
                () => this.setState({ showFlash: false }),
                1500
            );
        }
    }
    onLoggedIn() {
        this.setState({ showLogin: false });
        this.setFlash();
    }
    scrollToTop() {
        //scrollToOffset may not scroll all the way to the top without the setTimeout.
        setTimeout(
            () => this.flatList.scrollToOffset({ x: 0, y: 0, animated: true }),
            1
        );
    }
    _goToDate(jdate) {
        if (
            this.state.daysList > 6 &&
            Utils.isSameJdate(jdate, this.state.today)
        ) {
            goHomeToday(this.navigator, this.state.appData);
        } else if (!Utils.isSameJdate(jdate, this.state.currDate)) {
            this.setState(
                {
                    daysList: this.getDaysList(jdate),
                    currDate: jdate,
                    refreshing: false,
                },
                this.scrollToTop
            );
        } else {
            this.scrollToTop();
        }
    }
    _addDaysToEnd() {
        const daysList = this.state.daysList,
            day = daysList[daysList.length - 1].addDays(1);
        daysList.push(day);
        this.setState({
            daysList: daysList,
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
        daysList.push(jdate.addDays(3));
        if (isLargeScreen()) {
            daysList.push(jdate.addDays(4));
        }
        return daysList;
    }
    getDayOfSeven(jdate) {
        //Due to questions etc. there can be more than one Hefsek.
        const lastHefseks = this.state.appData.TaharaEvents.filter(
            te =>
                te.taharaEventType === TaharaEventType.Hefsek &&
                te.jdate.Abs < jdate.Abs &&
                te.jdate.diffDays(jdate) <= 7
        );
        if (lastHefseks.length > 0) {
            //For the Shiva Neki'im indicator we want only the latest one
            return lastHefseks[lastHefseks.length - 1].jdate.diffDays(jdate);
        }
    }
    /**
     * Get the element to render on the main screen
     */
    getElemementsToRender() {
        return this.state.showLogin ? (
            <Login
                onLoggedIn={this.onLoggedIn}
                pin={this.state.appData.Settings.PIN}
            />
        ) : (
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
                        onGoNext={this.nextDay}
                        helpUrl="index.html"
                        helpTitle="Help"
                    />
                    <FlatList
                        ref={flatList => (this.flatList = flatList)}
                        style={{ flex: 1 }}
                        data={this.state.daysList}
                        renderItem={this.renderItem}
                        keyExtractor={item =>
                            this.state.daysList.indexOf(item).toString()
                        }
                        onEndReached={this._addDaysToEnd}
                        onRefresh={this.prevDay}
                        refreshing={this.state.refreshing}
                    />
                </View>
                {this.state.showFlash && <Flash />}
                {this.state.showFirstTimeModal && (
                    <FirstTimeModal
                        locationName={this.state.appData.Settings.location.Name}
                        onClose={() =>
                            this.setState({ showFirstTimeModal: false })
                        }
                    />
                )}
            </View>
        );
    }
    /**
     * Render a single day
     * @param {{item:jDate}} param0 item will be a single jDate
     */
    renderItem({ item }) {
        const isToday = Utils.isSameJdate(this.state.today, item),
            lastRegularEntry = this.state.lastRegularEntry,
            lastEntry = this.state.lastEntry,
            lastEntryDate =
                lastRegularEntry &&
                item.Abs > lastRegularEntry.date.Abs &&
                lastRegularEntry.date,
            isHefsekDay =
                lastEntry && Utils.isSameJdate(item, lastEntry.hefsekDate);
        return (
            <SingleDayDisplay
                key={item.Abs}
                jdate={item}
                systemDate={this.state.systemDate}
                isToday={isToday}
                appData={this.state.appData}
                navigator={this.navigator}
                onUpdate={this.updateAppData}
                lastEntryDate={lastEntryDate}
                dayOfSeven={this.getDayOfSeven(item)}
                isHefsekDay={isHefsekDay}
            />
        );
    }
    render() {
        return <View style={{ flex: 1 }}>{this.getElemementsToRender()}</View>;
    }
}
