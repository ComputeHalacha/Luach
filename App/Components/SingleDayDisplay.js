import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Utils from '../Code/JCal/Utils';

export default class SingleDayDisplay extends Component {
    render() {
        const jd = this.props.jdate,
            location = this.props.location,
            dailyInfos = jd.getHolidays(location.Israel),
            dailyInfoText = dailyInfos.length ? <Text>{dailyInfos.join('\n')}</Text> : null,
            suntimes = jd.getSunriseSunset(location),
            sunrise = suntimes && suntimes.sunrise ?
                Utils.getTimeString(suntimes.sunrise) : 'Sun does not rise',
            sunset = suntimes && suntimes.sunset ?
                Utils.getTimeString(suntimes.sunset) : 'Sun does not set',
            problems = this.props.problems.map(po => <Text>{po.toString() + '.'}</Text>);
        return (
            <View>
                <Text style={styles.date}>{new Date().toDateString() + ', ' + jd.toString(true)}</Text>
                {dailyInfoText}
                <Text>{'Sedra of the week: ' + jd.getSedra(true).map((s) => s.eng).join(' - ')}</Text>
                <Text style={styles.location}>{'Zmanim for ' + location.Name}</Text>
                <Text>{'Sun Rises at ' + sunrise}</Text>
                <Text>{'Sun sets at ' + sunset + '\n\n'}</Text>
                {problems}
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
