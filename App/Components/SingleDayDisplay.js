import React, { Component } from 'react';
import { Button, StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import { Icon } from 'react-native-elements';
import Utils from '../Code/JCal/Utils';

/**
 * Display a home screen box for a single jewish date.
 */
export default class SingleDayDisplay extends Component {
    constructor(props) {
        super(props);
        this.navigate = props.navigate;

        this.newEntry = this.newEntry.bind(this);
        this.newOccasion = this.newOccasion.bind(this);
        this.showDateDetails = this.showDateDetails.bind(this);
        this.showProblems = this.showProblems.bind(this);
        this.monthView = this.monthView.bind(this);
    }
    newEntry() {
        const { jdate, onUpdate, location, appData, isToday } = this.props;
        this.navigate('NewEntry', { jdate, location, isToday, appData, onUpdate });
    }
    newOccasion() {
        const { jdate, onUpdate, appData } = this.props;
        this.navigate('NewOccasion', { jdate, onUpdate, appData });
    }
    monthView() {
        const { jdate, onUpdate, appData } = this.props;
        this.navigate('MonthView', { jdate, onUpdate, appData });
    }
    showDateDetails() {
        const { jdate, location } = this.props;
        this.navigate('DateDetails', { jdate, location });
    }
    showProblems() {
        const { jdate, onUpdate, appData } = this.props;
        this.navigate('FlaggedDates', { jdate, onUpdate, appData });
    }
    render() {
        const { jdate, location, isToday } = this.props,
            sdate = jdate.getDate(),
            dailyInfos = jdate.getHolidays(location.Israel),
            dailyInfoText = dailyInfos.length > 0 && <Text>{dailyInfos.join('\n')}</Text>,
            suntimes = jdate.getSunriseSunset(location),
            sunrise = suntimes && suntimes.sunrise ?
                Utils.getTimeString(suntimes.sunrise) : 'Sun does not rise',
            sunset = suntimes && suntimes.sunset ?
                Utils.getTimeString(suntimes.sunset) : 'Sun does not set',
            occasions = this.props.occasions,
            occasionText = occasions && occasions.length > 0 ?
                occasions.map((o, i) => <Text style={styles.occasionText} key={i}>{o.title}</Text>) : null,
            entries = this.props.entries,
            entriesText = entries && entries.length > 0 &&
                entries.map((e, i) => (<Text style={styles.entriesText} key={i}>{e.toKnownDateString()}</Text>)),
            todayText = isToday ? (<Text style={styles.todayText}>TODAY</Text>) : null;
        return (
            <View
                style={[styles.container, {
                    backgroundColor:
                    (entries && entries.length > 0 ? '#fee' :
                        (this.props.flag ? '#fe9' : (isToday ? '#eef' : '#fff')))
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
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
                        <View style={{ width: '75%', height: 75, flex: 0 }}>
                            <Text style={styles.location}>{'In ' + location.Name}</Text>
                            <Text>{'Sun Rises at ' + sunrise}</Text>
                            <Text>{'Sun sets at ' + sunset + '\n\n'}</Text>
                        </View>
                        <TouchableWithoutFeedback
                            onPress={this.showDateDetails}
                            style={{
                                flex: 0,
                                height: 75,
                                width: '25%',
                                alignSelf: 'center'
                            }}>
                            <View style={{ alignItems: 'center' }}>
                                <Icon color='#bbc' name='info' />
                                <Text style={{ fontSize: 12, color: '#bbc' }}>Zmanim</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    {entries && entries.length > 0 &&
                        <View style={styles.additionsViews}>
                            {entriesText}
                        </View>
                    }
                    {this.props.flag &&
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
                    {occasions && occasions.length > 0 &&
                        <View style={styles.additionsViews}>
                            {occasionText}
                        </View>
                    }
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
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
                            accessibilityLabel='Add a new Occasion for this date'
                            title='New Occasion'
                            onPress={this.newOccasion} />
                        <Button
                            color='#afb'
                            style={styles.btn}
                            accessibilityLabel='View Month'
                            title='Month View'
                            onPress={this.monthView} />
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
        fontSize: 23,
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
        alignItems: 'center'
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