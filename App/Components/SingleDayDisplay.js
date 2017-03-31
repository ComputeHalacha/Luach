import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Utils from '../Code/JCal/Utils';
import JDate from '../Code/JCal/jDate';
import Location from '../Code/JCal/Location'

export default class SingleDayDisplay extends Component {
    render() {
        const jd = this.props.jdate || new JDate(),
            location = this.props.location || Location.getJerusalem(),
            dailyInfos = jd.getHolidays(location.Israel),
            dailyInfoText = dailyInfos.length ? <Text>{dailyInfos.join('\n')}</Text> : null,
            suntimes = jd.getSunriseSunset(location),
            sunrise = suntimes && suntimes.sunrise ?
                Utils.getTimeString(suntimes.sunrise) : 'Sun does not rise',
            sunset = suntimes && suntimes.sunset ?
                Utils.getTimeString(suntimes.sunset) : 'Sun does not set',
            problems = this.props.problems || [],
            problemText = problems.map(po => <Text>{po.toString() + '.'}</Text>);
        return (
            <View>
                <Text style={styles.date}>{new Date().toDateString() + ', ' + jd.toString(true)}</Text>
                {dailyInfoText}
                <Text>{'Sedra of the week: ' + jd.getSedra(true).map((s) => s.eng).join(' - ')}</Text>
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
        color: '#008800',
        fontWeight: 'bold'
    }
    ,
    location: {
        marginTop: 10,
        color: '#880000',
        fontWeight: 'bold'
    },
});
