import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Utils from '../Code/JCal/Utils';
import JDate from '../Code/JCal/jDate';
import Location from '../Code/JCal/Location';

/**
 * Display a single jewish date.
 */
export default class SingleDayDisplay extends Component {
    render() {
        const jdate = this.props.jdate || new JDate(),
            sdate = jdate.getDate(),
            location = this.props.location || Location.getJerusalem(),
            dailyInfos = jdate.getHolidays(location.Israel),
            dailyInfoText = dailyInfos.length ? <Text>{dailyInfos.join('\n')}</Text> : null,
            suntimes = jdate.getSunriseSunset(location),
            sunrise = suntimes && suntimes.sunrise ?
                Utils.getTimeString(suntimes.sunrise) : 'Sun does not rise',
            sunset = suntimes && suntimes.sunset ?
                Utils.getTimeString(suntimes.sunset) : 'Sun does not set',
            problems = this.props.problems || [],
            problemText = problems.map(po => <Text>{`  * ${po.toString()}\n`}</Text>);
        return (
            <View>
                <Text style={styles.date}>
                    <Text style={styles.dateHeb}>
                        {jdate.toString()}</Text>
                        <Text>{'\n'}</Text>
                    <Text style={styles.dateEng}>
                        {Utils.toStringDate(sdate, true)}</Text>                    
                </Text>
                {dailyInfoText}
                <Text>{'Sedra of the week: ' + jdate.getSedra(true).map((s) => s.eng).join(' - ')}</Text>
                <Text style={styles.location}>{'Zmanim for ' + location.Name}</Text>
                <Text>{'Sun Rises at ' + sunrise}</Text>
                <Text>{'Sun sets at ' + sunset + '\n\n'}</Text>
                {problemText}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    date: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    dateEng: { color: '#080' },
    dateHeb: { color: '#008' },
    location: {
        marginTop: 10,
        color: '#800',
        fontWeight: 'bold'
    },
});