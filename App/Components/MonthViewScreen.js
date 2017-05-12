import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Icon, Grid, Row, Col } from 'react-native-elements';
import { getScreenWidth } from '../Code/GeneralUtils';
import jDate from '../Code/JCal/jDate';
import Utils from '../Code/JCal/Utils';
import { NightDay } from '../Code/Chashavshavon/Onah';
import { GeneralStyles } from './styles';

const Today = new jDate();

class Month {
    /**
     * @param {jDate | Date} date
     * @param {AppData} appData
     */
    constructor(date, appData) {
        this.isJdate = date instanceof jDate;
        this.appData = appData;

        //Set the date to the first of the month.
        if (this.isJdate) {
            this.date = new jDate(date.Year, date.Month, 1);
        }
        else {
            this.date = date.setDate(1);
        }
        this.getSingleDay = this.getSingleDay.bind(this);
    }
    static toString(weeks, isJdate) {
        let txt = '',
            firstWeek = weeks[0],
            firstDay = firstWeek[firstWeek.findIndex(d => d)],
            firstDayJdate = firstDay.jdate,
            firstDaySdate = firstDay.sdate,
            lastWeek = weeks[weeks.length - 1],
            lastDay = lastWeek[6] || lastWeek[lastWeek.findIndex(d => !d) - 1],
            lastDayJdate = lastDay.jdate,
            lastDaySdate = lastDay.sdate;
        if (isJdate) {
            txt = Utils.jMonthsEng[firstDayJdate.Month] + ' ' +
                firstDayJdate.Year.toString() + ' / ' +
                Utils.sMonthsEng[firstDaySdate.getMonth()] +
                (firstDaySdate.getMonth() !== lastDaySdate.getMonth() ?
                    ' - ' + Utils.sMonthsEng[lastDaySdate.getMonth()] : '') +
                ' ' + lastDaySdate.getFullYear().toString();
        }
        else {
            txt = Utils.sMonthsEng[firstDaySdate.getMonth()] + ' ' +
                lastDaySdate.getFullYear().toString() +
                Utils.jMonthsEng[firstDayJdate.Month] + ' ' +
                (firstDayJdate.Month !== lastDayJdate.Month ?
                    ' - ' + Utils.jMonthsEng[lastDayJdate.Month] : '') +
                ' ' + lastDayJdate.Year.toString();
        }
        return txt;
    }
    /**
     * Gets a 2 dimentional array for all the days in the month grouped by week.
     * Format is [weeks][days] where days are each an object {jdate, sdate, color, isToday}.
     */
    getAllDays() {
        const weeks = this.isJdate ?
            this.getAllDaysJdate() : this.getAllDaysSdate();

        if (weeks[0].findIndex(d => d) === -1) {
            weeks.shift();
        }
        if (weeks[weeks.length - 1].findIndex(d => d) === -1) {
            weeks.pop();
        }
        return weeks;
    }
    getSingleDay(date) {
        const jdate = (date instanceof jDate && date) || new jDate(date),
            sdate = (date instanceof Date && date) || date.getDate(),
            entryColor = '#fdd',
            probColor = '#ffa';

        let colorNight, colorDay, hasProb, hasEntry;
        if (this.appData.EntryList.list.some(e =>
            e.date.Abs === jdate.Abs && e.nightDay === NightDay.Night)) {
            colorNight = entryColor;
            hasEntry = true;
        }
        else if (this.appData.ProblemOnahs.some(po =>
            po.jdate.Abs === jdate.Abs && po.nightDay === NightDay.Night)) {
            colorNight = probColor;
            hasProb = true;
        }
        if (this.appData.EntryList.list.some(e =>
            e.date.Abs === jdate.Abs && e.nightDay === NightDay.Day)) {
            colorDay = entryColor;
            hasEntry = true;
        }
        else if (this.appData.ProblemOnahs.some(po =>
            po.jdate.Abs === jdate.Abs && po.nightDay === NightDay.Day)) {
            colorDay = probColor;
            hasProb = true;
        }
        return {
            jdate,
            sdate,
            colorNight,
            colorDay,
            hasEntry,
            hasProb,
            istoday: jdate.Abs === Today.Abs
        };
    }
    getAllDaysJdate() {
        const daysInMonth = jDate.daysJMonth(this.date.Year, this.date.Month),
            numberOfWeeks = this.date.DayOfWeek >= 5 && daysInMonth > 29 ? 6 : 5,
            weeks = Array.from({ length: numberOfWeeks }, () => new Array(7).fill(null));

        for (let day = 1, week = 0; day <= daysInMonth; day++) {
            const jdate = new jDate(this.date.Year, this.date.Month, day);
            weeks[week][jdate.DayOfWeek] = this.getSingleDay(jdate);
            if (jdate.DayOfWeek === 6) {
                week++;
            }
        }
        return weeks;
    }
    getAllDaysSdate() {
        const weeks = [Array(7)];
        let month = this.date.getMonth(),
            currWeek = 0;
        for (let currDay = this.date;
            currDay.getMonth() === month;
            currDay = new Date(currDay.setDate(currDay.getDate() + 1))) {

            const dow = currDay.getDay();
            weeks[currWeek][dow] = this.getSingleDay(currDay);
            if (dow === 6) {
                //We will need a new week for the following day.
                weeks.push(Array(7));
                currWeek++;
            }
        }
        return weeks;
    }
    get prev() {
        if (this.isJdate) {
            return new Month(this.date.addMonths(-1), this.appData);
        }
        else {
            return new Month(this.date.setMonth(-1), this.appData);
        }
    }
    get next() {
        if (this.isJdate) {
            return new Month(this.date.addMonths(1), this.appData);
        }
        else {
            return new Month(this.date.setMonth(1), this.appData);
        }
    }
}

export default class MonthViewScreen extends React.Component {
    static navigationOptions = () => ({
        title: 'View Full Month'
    });
    constructor(props) {
        super(props);

        this.navigate = props.navigation.navigate;
        const { jdate, appData } = props.navigation.state.params,
            date = appData.Settings.navigateBySecularDate ? jdate.getDate() : jdate;
        this.appData = appData;

        this.state = { month: new Month(date, this.appData) };

        this.goPrev = this.goPrev.bind(this);
        this.goNext = this.goNext.bind(this);
        this.goToday = this.goToday.bind(this);
    }
    goPrev() {
        const currMonth = this.state.month;
        this.setState({ month: currMonth.prev });
    }
    goNext() {
        const currMonth = this.state.month;
        this.setState({ month: currMonth.next });
    }
    goToday() {
        this.setState({ month: new Month(Today, this.appData) });
    }
    get flag() {
        return <View style={{
            backgroundColor: '#ff000055',
            alignItems: 'center',
            borderRadius: 40,
            padding: 3
        }}>
            <Icon
                size={11}
                name='flag'
                color={'#ffffff88'} />
        </View>;
    }
    getDayColumn(singleDay, index) {
        const colWidth = parseInt(getScreenWidth() / 7),
            jdate = singleDay && singleDay.jdate,
            shabbos = jdate && jdate.DayOfWeek === 6 &&
                jdate.getSedra(this.appData.Settings.location.Israel).map((s) =>
                    s.eng).join('\n'),
            holiday = jdate && jdate.getMajorHoliday();
        return (<Col size={colWidth} key={index}>
            {(jdate &&
                <TouchableOpacity
                    style={styles.singleDay}
                    onPress={() => {
                        if (singleDay.hasProb) {
                            this.navigate('FlaggedDates', { jdate, appData: this.appData });
                        }
                        else {
                            this.navigate('Home', { currDate: jdate, appData: this.appData });
                        }
                    }}>
                    <View style={[styles.singleDayView, { backgroundColor: ((holiday || shabbos) ? '#eef' : '#fff') }]}>
                        {singleDay.colorNight &&
                            <View style={{
                                position: 'absolute',
                                height: '100%',
                                width: '50%',
                                backgroundColor: singleDay.colorNight,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {singleDay.hasProb && this.flag}
                            </View>
                        }
                        {singleDay.colorDay &&
                            <View style={{
                                position: 'absolute',
                                height: '100%',
                                width: '50%',
                                left: '50%',
                                backgroundColor: singleDay.colorDay,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {singleDay.hasProb && this.flag}
                            </View>
                        }
                        <View style={styles.singleDayTextContent}>
                            <View style={styles.singleDayNumbersView}>
                                <Text>{singleDay && Utils.toJNum(jdate.Day)}</Text>
                                <Text>{singleDay && singleDay.sdate.getDate().toString()}</Text>
                            </View>
                            {(shabbos || holiday) &&
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 9, textAlign: 'center' }}>
                                        {holiday ? holiday : shabbos}</Text>
                                </View>}
                        </View>
                    </View>
                </TouchableOpacity>)
                ||
                <View style={styles.singleDayBlank}></View>
            }
        </Col>);
    }
    render() {
        const weeks = this.state.month.getAllDays();
        return <View style={GeneralStyles.container}>
            <View style={styles.headerView}>
                <Text style={styles.headerText}>{Month.toString(weeks, this.state.month.isJdate)}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Grid>
                    <Row containerStyle={{ height: 50 }}>
                        <Col style={styles.dayHeadView}>
                            <Text style={styles.dayHead}>Sun</Text></Col>
                        <Col style={styles.dayHeadView}>
                            <Text style={styles.dayHead}>Mon</Text></Col>
                        <Col style={styles.dayHeadView}>
                            <Text style={styles.dayHead}>Tue</Text></Col>
                        <Col style={styles.dayHeadView}>
                            <Text style={styles.dayHead}>Wed</Text></Col>
                        <Col style={styles.dayHeadView}>
                            <Text style={styles.dayHead}>Thu</Text></Col>
                        <Col style={styles.dayHeadView}>
                            <Text style={styles.dayHead}>Fri</Text></Col>
                        <Col style={styles.dayHeadView}>
                            <Text style={styles.dayHead}>Shb</Text></Col>
                    </Row>
                    {weeks.map((w, i) =>
                        <Row key={i}>
                            {w.map((d, di) => this.getDayColumn(d, di))}
                        </Row>
                    )}
                </Grid>
            </View>
            <View style={styles.footerBar}>
                <TouchableOpacity onPress={this.goPrev}>
                    <View>
                        <Icon name='arrow-back' color='#aaa' size={15} />
                        <Text style={styles.footerBarText}>Previous Month</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.goToday}>
                    <View>
                        <Icon color='#a77' name='view-carousel' />
                        <Text style={styles.footerBarText} >Today</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.goNext}>
                    <View>
                        <Icon color='#aaa' name='arrow-forward' size={15} />
                        <Text style={styles.footerBarText} >Next Month</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>;
    }
}

const styles = StyleSheet.create({
    headerView: {
        backgroundColor: '#99e',
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 5,
        paddingBottom: 10
    },
    headerText: {
        color: '#eef',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18
    },
    dayHeadView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#999',
        borderWidth: 1,
        borderColor: '#aaa'
    },
    dayHead: {
        textAlign: 'center',
        color: '#eef'
    },
    singleDay: {
        flex: 1
    },
    singleDayBlank: {
        flex: 1,
        backgroundColor: '#eee',
        borderWidth: 1,
        borderColor: '#ddd'
    },
    singleDayTextContent: {
        position: 'absolute',
        padding: 6,
        backgroundColor: 'rgba(0,0,0,0)',
        width: '100%',
        height: '100%',
    },
    singleDayView: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        width: '100%',
        height: '100%',
    },
    singleDayNumbersView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerBar: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#dde',
        padding: 8
    },
    footerBarText: { color: '#999', fontSize: 12 }
});