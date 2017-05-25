import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Icon, Grid, Row, Col } from 'react-native-elements';
import GestureRecognizer from 'react-native-swipe-gestures';
import { getScreenWidth } from '../Code/GeneralUtils';
import jDate from '../Code/JCal/jDate';
import Utils from '../Code/JCal/Utils';
import Month from '../Code/Month';
import { NightDay } from '../Code/Chashavshavon/Onah';
import { GeneralStyles } from './styles';

const Today = new jDate();

export default class MonthViewScreen extends React.Component {
    static navigationOptions = () => ({
        title: 'Full Month View'
    });
    constructor(props) {
        super(props);

        this.navigate = props.navigation.navigate;
        const { jdate, appData } = props.navigation.state.params,
            date = appData.Settings.navigateBySecularDate ? jdate.getDate() : jdate;
        this.appData = appData;
        this.israel = this.appData.Settings.location.Israel;
        this.state = { month: new Month(date, this.appData) };

        this.goPrev = this.goPrev.bind(this);
        this.goNext = this.goNext.bind(this);
        this.goToday = this.goToday.bind(this);
        this.goThisMonth = this.goThisMonth.bind(this);
        this.toggleMonthType = this.toggleMonthType.bind(this);
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
        this.navigate('Home', { appData: this.appData });
    }
    goThisMonth() {
        this.setState({ month: new Month(Today, this.appData) });
    }
    getFlag(nightDay) {
        return <View style={{
            alignItems: 'center'
        }}>
            <Icon
                size={nightDay === NightDay.Night ? 18 : 22}
                name={nightDay === NightDay.Night ? 'ios-moon' : 'ios-sunny'}
                type='ionicon'
                color={nightDay === NightDay.Night ? '#ffb' : '#ff000030'} />
        </View>;
    }
    toggleMonthType() {
        if (this.state.month.isJdate) {
            this.setState({ month: new Month(this.state.month.date.getDate(), this.appData) });
        }
        else {
            this.setState({ month: new Month(new jDate(this.state.month.date), this.appData) });
        }
    }
    getDayColumn(singleDay, index) {
        const colWidth = Utils.toInt(getScreenWidth() / 7),
            jdate = singleDay && singleDay.jdate,
            isToday = jdate && jdate.Abs === Today.Abs,
            shabbos = jdate && jdate.DayOfWeek === 6 &&
                jdate.getSedra(this.israel).map((s) =>
                    s.eng).join('\n'),
            holiday = jdate && jdate.getMajorHoliday(this.israel),
            specialColorDay = singleDay && ((singleDay.hasEntryDay && '#fdd') ||
                (singleDay.hasProbDay && '#ffa')),
            specialColorNight = singleDay && ((singleDay.hasEntryNight && '#fcc') ||
                (singleDay.hasProbNight && '#eea'));
        return (<Col size={colWidth} key={index}>
            {(jdate &&
                <TouchableOpacity
                    style={styles.singleDay}
                    onPress={() => {
                        if (singleDay.hasProbNight || singleDay.hasProbDay) {
                            this.navigate('FlaggedDates', { jdate, appData: this.appData });
                        }
                        else {
                            this.navigate('Home', { currDate: jdate, appData: this.appData });
                        }
                    }}>
                    <View style={[styles.singleDayView, {
                        backgroundColor: ((holiday || shabbos) ? '#eef' : '#fff'),
                        borderColor: isToday ? '#55f' : '#ddd',
                        borderWidth: isToday ? 2 : 1,
                        borderRadius: 5
                    }]}>
                        {specialColorNight &&
                            <View style={{
                                position: 'absolute',
                                height: '100%',
                                width: '50%',
                                backgroundColor: specialColorNight,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {this.getFlag(NightDay.Night)}
                            </View>
                        }
                        {specialColorDay &&
                            <View style={{
                                position: 'absolute',
                                height: '100%',
                                width: '50%',
                                left: '50%',
                                backgroundColor: specialColorDay,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {this.getFlag(NightDay.Day)}
                            </View>
                        }
                        <View style={styles.singleDayTextContent}>
                            <View style={styles.singleDayNumbersView}>
                                <Text style={styles.sdate}>{singleDay && singleDay.sdate.getDate().toString()}</Text>
                                <Text style={styles.jdate}>{singleDay && Utils.toJNum(jdate.Day)}</Text>
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
                <TouchableOpacity onPress={this.toggleMonthType}>
                    <Text style={styles.monthToggle}>{(this.state.month.isJdate ? 'Secular ' : 'Jewish ')}</Text>
                </TouchableOpacity>
            </View>
            <GestureRecognizer
                style={{ flex: 1, backgroundColor: '#ddd' }}
                onSwipeUp={this.goNext}
                onSwipeDown={this.goPrev}
                onSwipeLeft={this.goNext}
                onSwipeRight={this.goPrev}>
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
            </GestureRecognizer>
            <View style={styles.footerBar}>
                <TouchableOpacity onPress={this.goToday}>
                    <View style={styles.todayView}>
                        <Image
                            style={{ width: 15, height: 15 }}
                            resizeMode='stretch'
                            source={require('../Images/logo.png')} />
                        <Text style={styles.footerBarText}>Today</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.goPrev} style={styles.footerButton}>
                    <View style={[styles.footerView, { borderRightWidth: 1 }]}>
                        <Icon iconStyle={styles.footerIcon} name='arrow-back' />
                        <Text style={styles.footerBarText}>Previous</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.goThisMonth} style={styles.footerButton}>
                    <View style={styles.footerView}>
                        <Icon iconStyle={styles.footerIcon} name='view-carousel' />
                        <Text style={styles.footerBarText}>This Month</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.goNext} style={styles.footerButton}>
                    <View style={[styles.footerView, { borderLeftWidth: 1 }]}>
                        <Icon iconStyle={styles.footerIcon} name='arrow-forward' />
                        <Text style={styles.footerBarText}>Next</Text>
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
        justifyContent: 'space-between',
        paddingTop: 5,
        paddingBottom: 10,
        flexDirection: 'row'
    },
    headerText: {
        color: '#eef',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        paddingLeft: 10
    },
    monthToggle: {
        fontSize: 11,
        padding: 5,
        marginRight: 10,
        backgroundColor: '#aaf',
        color: '#00f',
        borderRadius: 6
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
        width: '100%',
        height: '100%',
    },
    singleDayNumbersView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    jdate: { fontSize: 11, fontWeight: 'bold', color: '#008' },
    sdate: { fontSize: 11, color: '#080' },
    footerBar: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#777',
        padding: 0,
        margin: 0,
        borderTopWidth: 1,
        width: '100%',
        height: 42
    },
    footerButton: {
        flex: 1
    },
    footerView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#888',
        backgroundColor: '#666',
        paddingTop: 5,
        paddingBottom: 5
    },
    todayView: {
        flex: 0,
        width: '10%',
        minWidth: 50,
        height: '100%',
        borderRightWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#888',
        backgroundColor: '#666',
        paddingTop: 5,
        paddingBottom: 5
    },
    footerBarText: {
        fontSize: 10,
        color: '#eee',
        textAlign: 'center',
        flexWrap: 'wrap'
    },
    footerIcon: {
        fontSize: 20,
        color: '#eee'
    }
});