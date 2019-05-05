import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    TouchableHighlight,
} from 'react-native';
import { Icon } from 'react-native-elements';
import GestureRecognizer from 'react-native-swipe-gestures';
import { getScreenWidth, goHomeToday } from '../../Code/GeneralUtils';
import { GridView, Row, Column } from '../Components/GridView';
import jDate from '../../Code/JCal/jDate';
import Utils from '../../Code/JCal/Utils';
import Month from '../../Code/Month';
import { NightDay } from '../../Code/Chashavshavon/Onah';
import { TaharaEventType } from '../../Code/Chashavshavon/TaharaEvent';
import { GeneralStyles } from '../styles';

export default class MonthViewScreen extends React.PureComponent {
    static navigationOptions = ({ navigation }) => {
        const { jdate, sdate, appData, title } = navigation.state.params;
        return {
            title: title,
            headerRight: (
                <TouchableHighlight
                    onPress={() =>
                        navigation.navigate('ExportData', {
                            appData,
                            jdate,
                            sdate: sdate || jdate.sdate,
                            dataSet: 'Zmanim - ' + title,
                        })
                    }>
                    <View style={{ marginRight: 10 }}>
                        <Icon name="import-export" color="#aca" size={25} />
                        <Text style={{ fontSize: 10, color: '#797' }}>
                            Export Data
                        </Text>
                    </View>
                </TouchableHighlight>
            ),
        };
    };

    constructor(props) {
        super(props);

        this.navigate = props.navigation.navigate;
        const { jdate, appData, onUpdate } = props.navigation.state.params,
            date = appData.Settings.navigateBySecularDate
                ? jdate.getDate()
                : jdate,
            today = appData.Settings.navigateBySecularDate
                ? new jDate()
                : Utils.nowAtLocation(appData.Settings.location);
        this.appData = appData;
        this.onUpdate = onUpdate;
        this.israel = this.appData.Settings.location.Israel;
        const month = new Month(date, this.appData);
        this.state = {
            month,
            weeks: month.getAllDays(),
            today,
        };

        this.goPrevYear = this.goPrevYear.bind(this);
        this.goNextYear = this.goNextYear.bind(this);
        this.goPrevMonth = this.goPrevMonth.bind(this);
        this.goNextMonth = this.goNextMonth.bind(this);
        this.goToday = this.goToday.bind(this);
        this.goThisMonth = this.goThisMonth.bind(this);
        this.toggleMonthType = this.toggleMonthType.bind(this);
    }
    componentDidMount() {
        this.setNavProps();
    }
    goPrevYear() {
        const month = this.state.month.prevYear;
        this.setState(
            {
                month,
                weeks: month.getAllDays(),
            },
            this.setNavProps
        );
    }
    goNextYear() {
        const month = this.state.month.nextYear;
        this.setState(
            {
                month,
                weeks: month.getAllDays(),
            },
            this.setNavProps
        );
    }
    goPrevMonth() {
        const month = this.state.month.prevMonth;
        this.setState(
            {
                month,
                weeks: month.getAllDays(),
            },
            this.setNavProps
        );
    }
    goNextMonth() {
        const month = this.state.month.nextMonth;
        this.setState(
            {
                month,
                weeks: month.getAllDays(),
            },
            this.setNavProps
        );
    }
    goToday() {
        goHomeToday(this.props.navigation, this.appData);
    }
    goThisMonth() {
        const month = new Month(
            this.state.month.isJdate
                ? this.state.today
                : this.state.today.getDate(),
            this.appData
        );
        this.setState(
            {
                month,
                weeks: month.getAllDays(),
            },
            this.setNavProps
        );
    }
    getFlag(nightDay) {
        return (
            <View
                style={{
                    alignItems: 'center',
                }}>
                <Icon
                    size={nightDay === NightDay.Night ? 18 : 22}
                    name={
                        nightDay === NightDay.Night ? 'ios-moon' : 'ios-sunny'
                    }
                    type="ionicon"
                    color={nightDay === NightDay.Night ? '#ffb' : '#ff000030'}
                />
            </View>
        );
    }
    toggleMonthType() {
        let date;
        //Current: Jewish, toggling to Secular
        if (this.state.month.isJdate) {
            //If the current Jewish date is being shown,
            //change to the month of the current Secular date.
            if (Utils.isSameJMonth(this.state.month.date, this.state.today)) {
                date = this.state.today.getDate();
            } else {
                //Get the secular date of the first day
                //of the currently displayed Jewish month.
                date = this.state.month.date.getDate();
                //If most of the currently displayed Jewish Month
                //was during the next Secular month...
                if (date > 16) {
                    //Display the next secular month instead.
                    date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                }
            }
        }
        //Current: Secular, toggling to Jewish
        else {
            //If the current Secular date is being shown,
            //change to the month of the current Jewish date.
            if (
                Utils.isSameSMonth(
                    this.state.month.date,
                    this.state.today.getDate()
                )
            ) {
                date = this.state.today;
            } else {
                //Get the Jewish date of the first day
                //of the currently displayed Secular month.
                date = new jDate(this.state.month.date);
            }
        }

        const month = new Month(date, this.appData);
        this.setState(
            {
                month,
                weeks: month.getAllDays(),
            },
            this.setNavProps
        );
    }
    getDayColumn(singleDay, index) {
        const colWidth = Utils.toInt(getScreenWidth() / 7),
            jdate = singleDay && singleDay.jdate,
            isToday = jdate && Utils.isSameJdate(jdate, this.state.today),
            shabbos =
                jdate &&
                jdate.DayOfWeek === 6 &&
                jdate
                    .getSedra(this.israel)
                    .map(s => s.eng)
                    .join('\n'),
            holiday = jdate && jdate.getMajorHoliday(this.israel),
            specialColorDay =
                singleDay &&
                ((singleDay.hasEntryDay && '#fdd') ||
                    (singleDay.hasProbDay && '#ffa')),
            specialColorNight =
                singleDay &&
                ((singleDay.hasEntryNight && '#fcc') ||
                    (singleDay.hasProbNight && '#eea'));
        return (
            <Column size={colWidth} key={index}>
                {(jdate && (
                    <TouchableOpacity
                        style={styles.singleDay}
                        onPress={() =>
                            this.navigate('Home', {
                                currDate: jdate,
                                appData: this.appData,
                            })
                        }>
                        <View
                            style={[
                                styles.singleDayView,
                                {
                                    backgroundColor: singleDay.isHefeskDay
                                        ? '#f1fff1'
                                        : holiday || shabbos
                                        ? '#eef'
                                        : '#fff',
                                    borderColor: isToday ? '#55f' : '#ddd',
                                    borderWidth: isToday ? 2 : 1,
                                    borderRadius: 5,
                                },
                            ]}>
                            {specialColorNight && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        height: '100%',
                                        width: '50%',
                                        backgroundColor: specialColorNight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                    {this.getFlag(NightDay.Night)}
                                </View>
                            )}
                            {specialColorDay && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        height: '100%',
                                        width: '50%',
                                        left: '50%',
                                        backgroundColor: specialColorDay,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                    {this.getFlag(NightDay.Day)}
                                </View>
                            )}
                            <View style={styles.singleDayTextContent}>
                                <View style={styles.singleDayNumbersView}>
                                    <Text style={styles.sdate}>
                                        {singleDay &&
                                            singleDay.sdate
                                                .getDate()
                                                .toString()}
                                    </Text>
                                    <Text style={styles.jdate}>
                                        {singleDay && Utils.toJNum(jdate.Day)}
                                    </Text>
                                </View>
                                {(shabbos || holiday) && (
                                    <View
                                        style={{
                                            flex: 1,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                        <Text
                                            style={{
                                                fontSize: 9,
                                                textAlign: 'center',
                                            }}>
                                            {holiday ? holiday : shabbos}
                                        </Text>
                                    </View>
                                )}
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-around',
                                    }}>
                                    {this.appData.Settings
                                        .showEntryFlagOnHome &&
                                        singleDay.taharaEvents.length > 0 &&
                                        singleDay.taharaEvents.map((te, i) => (
                                            <TaharaEventIcon
                                                key={i}
                                                taharaEvent={te}
                                            />
                                        ))}
                                    {singleDay.event && (
                                        <Icon
                                            size={18}
                                            color={singleDay.event.color}
                                            name="event"
                                        />
                                    )}
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )) || <View style={styles.singleDayBlank} />}
            </Column>
        );
    }
    setNavProps() {
        const firstDay = Month.getFirstDay(this.state.weeks),
            jdate = firstDay.jdate,
            sdate = firstDay.sdate,
            title = this.state.month.isJdate
                ? jdate.monthName()
                : `${
                      Utils.sMonthsEng[sdate.getMonth()]
                  } ${sdate.getFullYear()}`;

        this.props.navigation.setParams({
            jdate,
            sdate,
            appData: this.appData,
            title,
        });
    }
    render() {
        const weeks = this.state.weeks;
        return (
            <View style={GeneralStyles.container}>
                <View style={styles.headerView}>
                    <Text style={styles.headerText}>
                        {Month.toString(weeks, this.state.month.isJdate)}
                    </Text>
                    <TouchableOpacity onPress={this.toggleMonthType}>
                        <Text style={styles.monthToggle}>
                            {this.state.month.isJdate ? 'Secular ' : 'Jewish '}
                        </Text>
                    </TouchableOpacity>
                </View>
                <GestureRecognizer
                    style={{ flex: 1, backgroundColor: '#ddd' }}
                    config={{
                        velocityThreshold: 0.2,
                        directionalOffsetThreshold: 40,
                    }}
                    onSwipeUp={this.goNextYear}
                    onSwipeDown={this.goPrevYear}
                    onSwipeLeft={this.goNextMonth}
                    onSwipeRight={this.goPrevMonth}>
                    <GridView>
                        <Row containerStyle={{ height: 50 }}>
                            <Column style={styles.dayHeadView}>
                                <Text style={styles.dayHead}>Sun</Text>
                            </Column>
                            <Column style={styles.dayHeadView}>
                                <Text style={styles.dayHead}>Mon</Text>
                            </Column>
                            <Column style={styles.dayHeadView}>
                                <Text style={styles.dayHead}>Tue</Text>
                            </Column>
                            <Column style={styles.dayHeadView}>
                                <Text style={styles.dayHead}>Wed</Text>
                            </Column>
                            <Column style={styles.dayHeadView}>
                                <Text style={styles.dayHead}>Thu</Text>
                            </Column>
                            <Column style={styles.dayHeadView}>
                                <Text style={styles.dayHead}>Fri</Text>
                            </Column>
                            <Column style={styles.dayHeadView}>
                                <Text style={styles.dayHead}>Shb</Text>
                            </Column>
                        </Row>
                        {weeks.map((w, i) => (
                            <Row key={i}>
                                {w.map((d, di) => this.getDayColumn(d, di))}
                            </Row>
                        ))}
                    </GridView>
                </GestureRecognizer>
                <View style={styles.footerBar}>
                    <TouchableOpacity onPress={this.goToday}>
                        <View style={styles.todayView}>
                            <Image
                                style={{ width: 15, height: 15 }}
                                resizeMode="stretch"
                                source={require('../Images/logo.png')}
                            />
                            <Text style={styles.footerBarText}>Today</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={this.goPrevMonth}
                        style={styles.footerButton}>
                        <View style={styles.footerView}>
                            <Icon
                                iconStyle={styles.footerIcon}
                                name="arrow-back"
                            />
                            <Text style={styles.footerBarText}>Previous</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={this.goThisMonth}
                        style={styles.footerButton}>
                        <View style={styles.footerView}>
                            <Icon
                                iconStyle={styles.footerIcon}
                                name="view-carousel"
                            />
                            <Text style={styles.footerBarText}>This Month</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={this.goNextMonth}
                        style={styles.footerButton}>
                        <View style={styles.footerView}>
                            <Icon
                                iconStyle={styles.footerIcon}
                                name="arrow-forward"
                            />
                            <Text style={styles.footerBarText}>Next</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            this.navigate('Browser', {
                                url: 'MonthView.html',
                                title: 'Month View',
                                appData: this.appData,
                                onUpdate: this.onUpdate,
                            })
                        }>
                        <View style={styles.helpView}>
                            <Icon size={16} color="#ddf" name="help" />
                            <Text style={styles.footerBarText}>Help</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

function TaharaEventIcon(props) {
    let color, name;
    switch (props.taharaEvent.taharaEventType) {
        case TaharaEventType.Hefsek:
            color = '#8c8';
            name = 'flare';
            break;
        case TaharaEventType.Shailah:
            color = '#f1d484';
            name = 'report-problem';
            break;
        case TaharaEventType.Mikvah:
            color = '#99f';
            name = 'beenhere';
            break;
        case TaharaEventType.Bedika:
            color = '#f5f';
            name = 'remove-red-eye';
            break;
    }
    return <Icon color={color} name={name} size={18} />;
}

const styles = StyleSheet.create({
    headerView: {
        backgroundColor: '#99e',
        flex: 0,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 5,
        paddingBottom: 10,
        flexDirection: 'row',
    },
    headerText: {
        color: '#eef',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        paddingLeft: 10,
    },
    monthToggle: {
        fontSize: 11,
        padding: 5,
        marginRight: 10,
        backgroundColor: '#aaf',
        color: '#00f',
        borderRadius: 6,
    },
    dayHeadView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#999',
        borderWidth: 1,
        borderColor: '#aaa',
    },
    dayHead: {
        textAlign: 'center',
        color: '#eef',
    },
    singleDay: {
        flex: 1,
    },
    singleDayBlank: {
        flex: 1,
        backgroundColor: '#eee',
        borderWidth: 1,
        borderColor: '#ddd',
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
        height: 42,
    },
    footerButton: {
        flex: 1,
    },
    footerView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#888',
        backgroundColor: '#666',
        paddingTop: 5,
        paddingBottom: 5,
        borderRightWidth: 1,
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
        paddingBottom: 5,
    },
    helpView: {
        flex: 0,
        width: 30,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#666',
    },
    footerBarText: {
        fontSize: 10,
        color: '#eee',
        textAlign: 'center',
        flexWrap: 'wrap',
    },
    footerIcon: {
        fontSize: 20,
        color: '#eee',
    },
});
