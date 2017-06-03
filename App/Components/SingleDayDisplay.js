import React, { Component } from 'react';
import { Button, StyleSheet, Text, View, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import Utils from '../Code/JCal/Utils';
import { log } from '../Code/GeneralUtils';
import { UserOccasion } from '../Code/JCal/UserOccasion';
/**
 * Display a home screen box for a single jewish date.
 *
 * PROPS ------------------------------
 *   jdate
 *   isToday
 *   appData
 *   navigator
 *   onUpdate
 *   lastEntryDate
 */
export default class SingleDayDisplay extends Component {
    constructor(props) {
        super(props);
        this.navigator = props.navigator;

        this.newEntry = this.newEntry.bind(this);
        this.newOccasion = this.newOccasion.bind(this);
        this.showDateDetails = this.showDateDetails.bind(this);
        this.showProblems = this.showProblems.bind(this);
        this.monthView = this.monthView.bind(this);
        this.changeLocation = this.changeLocation.bind(this);
    }
    componentWillUpdate(nextProps) {
        const prevAppData = this.props.appData,
            newAppData = nextProps.appData;
        if (!(prevAppData || newAppData)) {
            log('Refreshed Single Day:( - either new appdata or old appdata was nuthin`');
            return true;
        }
        if (!prevAppData.Settings.isSameSettings(newAppData.Settings)) {
            log('Refreshed Single Day:( - Settings were not the same');
            return true;
        }
        if (prevAppData.UserOccasions.length !== newAppData.UserOccasions.length) {
            log('Refreshed Single Day:( - User Occasions list were not the same length');
            return true;
        }
        if (!prevAppData.UserOccasions.every(uo =>
            newAppData.UserOccasions.some(uon => uon.isSameOccasion(uo)))) {
            log('Refreshed Single Day:( - Occasions were not all the same');
            return true;
        }
        if (prevAppData.EntryList.list.length !== newAppData.EntryList.list.length) {
            log('Refreshed Single Day:( - Entries list were not the same length');
            return true;
        }
        if (!prevAppData.EntryList.list.every(e =>
            newAppData.EntryList.list.some(en => en.isSameEntry(e)))) {
            log('Refreshed Single Day:( - Entries were not all the same');
            return true;
        }
        if (prevAppData.ProblemOnahs.length !== newAppData.ProblemOnahs.length) {
            log('Refreshed Single Day:( - Probs list were not the same length');
            return true;
        }
        if (!prevAppData.ProblemOnahs.every(po =>
            newAppData.ProblemOnahs.some(pon => pon.isSameProb(po)))) {
            log('Refreshed Single Day:( - Probs were not all the same');
            return true;
        }
        log('Single Day Refresh Prevented');
        return false;
    }
    newEntry() {
        this.navigator.navigate('NewEntry', this.props);
    }
    newOccasion() {
        this.navigator.navigate('NewOccasion', this.props);
    }
    monthView() {
        this.navigator.navigate('MonthView', this.props);
    }
    showDateDetails() {
        this.navigator.navigate('DateDetails', this.props);
    }
    showProblems() {
        this.navigator.navigate('FlaggedDates', this.props);
    }
    changeLocation() {
        this.navigator.navigate('FindLocation', this.props);
    }
    editEntry(entry) {
        this.navigator.navigate('NewEntry', { entry, ...this.props });
    }
    render() {
        const { appData, jdate, isToday } = this.props,
            location = appData.Settings.location,
            flag = appData.Settings.showProbFlagOnHome &&
                appData.ProblemOnahs.some(po => po.jdate.Abs === jdate.Abs),
            occasions = appData.UserOccasions.length > 0 ?
                UserOccasion.getOccasionsForDate(jdate, appData.UserOccasions) : [],
            entries = appData.Settings.showEntryFlagOnHome ?
                appData.EntryList.list.filter(e => e.date.Abs === jdate.Abs) : [],
            sdate = jdate.getDate(),
            dailyInfos = jdate.getHolidays(location.Israel),
            dailyInfoText = dailyInfos.length > 0 && <Text>{dailyInfos.join('\n')}</Text>,
            suntimes = jdate.getSunriseSunset(location),
            sunrise = suntimes && suntimes.sunrise ?
                Utils.getTimeString(suntimes.sunrise) : 'Sun does not rise',
            sunset = suntimes && suntimes.sunset ?
                Utils.getTimeString(suntimes.sunset) : 'Sun does not set',
            occasionText = occasions && occasions.length > 0 ?
                occasions.map((o, i) => <Text style={styles.occasionText} key={i}>{o.title}</Text>) : null,
            entriesText = entries && entries.length > 0 &&
                entries.map((e, i) => (
                    <TouchableOpacity key={i} onPress={() => this.editEntry(e)}>
                        <Text style={styles.entriesText}>{e.toKnownDateString()}</Text>
                    </TouchableOpacity>)),
            todayText = isToday ? (<Text style={styles.todayText}>TODAY</Text>) : null;
        let daysSinceLastEntry;
        if (appData.Settings.showEntryFlagOnHome && this.props.lastEntryDate) {
            const dayNum = this.props.lastEntryDate.diffDays(jdate) + 1;
            if (dayNum > 1) {
                daysSinceLastEntry =
                    <View style={styles.additionsViews}>
                        <Text style={{ fontSize: 10 }}>{Utils.toSuffixed(dayNum) +
                            ' day of last Entry'}</Text>
                    </View>;
            }
        }
        return (
            <View
                style={[styles.container, {
                    backgroundColor:
                    (entries && entries.length > 0 ? '#fee' :
                        (flag ? '#fe9' : (isToday ? '#eef' : '#fff')))
                }]}>
                <View style={{ margin: 15, flex: 1 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.dateNumEng}>{sdate.getDate().toString()}</Text>
                        {todayText}
                        <Text style={styles.dateNumHeb}>{Utils.toJNum(jdate.Day)}</Text>
                    </View>
                    <Text style={styles.date}>
                        <Text style={styles.dateHeb}>
                            {jdate.toString()}</Text>
                        <Text>{'\n'}</Text>
                        <Text style={styles.dateEng}>
                            {Utils.toStringDate(sdate, true)}</Text>
                    </Text>
                    {dailyInfoText}
                    <Text>{'Sedra of the week: ' + jdate.getSedra(true).map((s) => s.eng).join(' - ')}</Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ width: '65%', height: 75, flex: 0 }}>
                            <TouchableOpacity onPress={this.changeLocation}>
                                <Text style={styles.location}>{'In ' + location.Name}</Text>
                            </TouchableOpacity>
                            <Text>{'Sun Rises at ' + sunrise}</Text>
                            <Text>{'Sun sets at ' + sunset + '\n\n'}</Text>
                        </View>
                        <View style={{
                            flex: 0,
                            width: '35%',
                            justifyContent: 'center',
                            alignItems: 'flex-end'
                        }}>
                            <TouchableWithoutFeedback onPress={this.showDateDetails}>
                                <View style={{ alignItems: 'center', marginBottom: 10 }}>
                                    <Icon color='#bbc' name='info' />
                                    <Text style={{ fontSize: 12, color: '#bbc' }}>   Zmanim   </Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={this.monthView}>
                                <View style={{ alignItems: 'center' }}>
                                    <Icon color='#bbc' name='calendar' type='octicon' />
                                    <Text style={{ fontSize: 12, color: '#bbc', textAlign: 'center' }}>{'Month View'}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                    {entries && entries.length > 0 &&
                        <View style={styles.additionsViews}>
                            {entriesText}
                        </View>
                    }
                    {flag &&
                        <TouchableWithoutFeedback style={styles.additionsViews} onPress={this.showProblems}>
                            <View style={styles.additionsViews}>
                                <View style={{
                                    backgroundColor: '#f00',
                                    alignItems: 'center',
                                    borderRadius: 40,
                                    padding: 6
                                }}>
                                    <Icon
                                        size={15}
                                        name='flag'
                                        color={'#fff'} />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    }
                    {daysSinceLastEntry}
                    {occasions && occasions.length > 0 &&
                        <View style={styles.additionsViews}>
                            {occasionText}
                        </View>
                    }
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        marginTop: 10
                    }}>
                        <Button
                            color='#abf'
                            style={styles.btn}
                            accessibilityLabel='Add a new Entry'
                            title='New Entry'
                            onPress={this.newEntry} />
                        <Button
                            color='#fba'
                            style={styles.btn}
                            accessibilityLabel='Add a new Event for this date'
                            title='New Event'
                            onPress={this.newOccasion} />
                    </View>
                </View>
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexWrap: 'wrap',
        borderWidth: 1,
        borderColor: '#777',
        borderRadius: 6,
        padding: 0,
        margin: 10,
        backgroundColor: '#fff'
    },
    date: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    todayText: {
        color: '#800',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1
    },
    dateNumEng: {
        color: '#080',
        textAlign: 'left',
        fontSize: 23,
        fontWeight: 'bold',
        flex: 1
    },
    dateNumHeb: {
        color: '#008',
        textAlign: 'right',
        fontSize: 23,
        fontWeight: 'bold',
        textAlignVertical: 'top',
        flex: 1
    },
    dateEng: { color: '#080' },
    dateHeb: { color: '#008' },
    location: {
        marginTop: 10,
        color: '#800',
        fontWeight: 'bold'
    },
    btn: { fontSize: 7, height: 25 },
    additionsViews: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 5
    },
    entriesText: {
        color: '#e55',
        fontWeight: 'bold',
        padding: 4
    },
    occasionText: {
        color: '#080',
        fontWeight: 'bold',
        padding: 4
    }
});