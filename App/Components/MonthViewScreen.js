import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Icon, Grid, Row, Col } from 'react-native-elements';
import { getScreenWidth } from '../Code/GeneralUtils';
import jDate from '../Code/JCal/jDate';
import Utils from '../Code/JCal/Utils';
import { GeneralStyles } from './styles';

const Today = new jDate();

class Month {
    /**
     * @param {jDate | Date} date
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
    toString() {
        if (this.isJdate) {
            return Utils.jMonthsEng[this.date.Month] + ' ' +
                this.date.Year.toString();
        }
        else {
            return Utils.sMonthsEng[this.date.getMonth()] + ' ' +
                this.date.getFullYear().toString();
        }
    }
    /**
     * Gets a 2 dimentional array for all the days in the month grouped by week.
     * Format is [weeks][days] where days are each an object {jdate, sdate, color, isToday}.
     */
    getAllDays() {
        return this.isJdate ?
            this.getAllDaysJdate() : this.getAllDaysSdate();
    }
    getSingleDay(date) {
        const jdate = (date instanceof jDate && date) || new jDate(date),
            sdate = (date instanceof Date && date) || date.getDate();

        let color = null;
        if (this.appData.EntryList.list.some(e => e.date.Abs === jdate.Abs)) {
            color = '#fee';
        }
        else if (this.appData.ProblemOnahs.some(po => po.jdate.Abs === jdate.Abs)) {
            color = '#fe9';
        }
        return {
            jdate: jdate,
            sdate: sdate,
            color: color,
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
    render() {
        const weeks = this.state.month.getAllDays(),
            colWidth = parseInt(getScreenWidth() / 7);
        return <View style={GeneralStyles.container}>
            <View style={styles.headerView}>
                <Text style={GeneralStyles.headerText}>{this.state.month.toString()}</Text>
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
                            {w.map((d, di) =>
                                <Col size={colWidth} key={di}>
                                    {(d &&
                                        <TouchableOpacity
                                            style={styles.singleDay}
                                            onPress={() =>
                                                this.navigate('Home', { currDate: d.jdate, appData: this.appData })}>
                                            <View style={[styles.singleDayView, { backgroundColor: d.color }]}>
                                                <View style={styles.singleDayNumbersView}>
                                                    <Text>{d && Utils.toJNum(d.jdate.Day)}</Text>
                                                    <Text>{d && d.sdate.getDate().toString()}</Text>
                                                </View>
                                                {d.jdate.DayOfWeek === 6 &&
                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={{ fontSize: 9, textAlign: 'center' }}>{d.jdate.getSedra(this.appData.Settings.location.Israel).map((s) =>
                                                            s.eng).join('\n')}</Text>
                                                    </View>
                                                }

                                            </View>
                                        </TouchableOpacity>)
                                        ||
                                        <View style={styles.singleDayBlank}></View>
                                    }
                                </Col>
                            )}
                        </Row>
                    )}
                </Grid>
            </View>
            <View style={styles.footerBar}>
                <TouchableOpacity onPress={this.goPrev}>
                    <View>
                        <Icon name='arrow-back' />
                        <Text>Previous</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.goToday}>
                    <View>
                        <Icon name='view-carousel' />
                        <Text>Today</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.goNext}>
                    <View>
                        <Icon name='arrow-forward' />
                        <Text>Next</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View >;
    }
}

const styles = StyleSheet.create({
    headerView: {
        backgroundColor: '#99e',
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5
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
    singleDayView: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 5
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
        backgroundColor: '#999'
    }
});