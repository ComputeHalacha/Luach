import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default class SingleDayDisplay extends Component {
    render() {
        const jd = this.props.jdate,
            location = this.props.location,
            suntimes = jd.getSunriseSunset(location),
            sunrise = suntimes.sunrise.hour + ':' + suntimes.sunrise.minute,
            sunset = suntimes.sunset.hour + ':' + suntimes.sunset.minute;
        return (
            <View>
                <Text>
                    {jd.toString()}</Text>
                <Text style={styles.test}>{location.Name}
                </Text>
                <Text>
                    {jd.getSedra(true).map((s) => s.eng).join(' - ')}</Text>
                <Text>
                    {'Sun Rises at ' + sunrise}</Text>
                <Text>
                    {'Sun sets at ' + sunset}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    test: {
        fontSize: 30,
        textAlign: 'center',
        margin: 10,
        color: '#ff0000',
        fontWeight: 'bold'
    },
});
