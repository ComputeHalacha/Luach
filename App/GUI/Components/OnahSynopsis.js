import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import Utils from '../../Code/JCal/Utils';
import { NightDay } from '../../Code/Chashavshavon/Onah';

export default function OnahSynopsis(props) {
    const jdate = props.jdate,
        isNight = props.nightDay === NightDay.Night;

    return <View style={styles.viewSynopsis}>
        <Text style={styles.textSynopsisLabel}>
            Please review the chosen Date and Onah
                </Text>
        <View style={styles.viewSynopsisContent}>
            <View style={[styles.iconContainer,
            { backgroundColor: isNight ? '#eaeaf5' : '#fff' }]}>
                <Icon name={isNight ? 'ios-moon' : 'ios-sunny'}
                    color={isNight ? '#eee100' : '#fff100'}
                    type='ionicon'
                    size={40} />
            </View>
            <View style={{ paddingLeft: 15 }}>
                <Text style={{ fontWeight: 'bold', color: '#800' }}>
                    {Utils.dowEng[jdate.DayOfWeek] + ' ' +
                        (isNight ? 'Night-Time' : 'Day-Time')}</Text>
                <Text style={{ color: '#008' }}>{jdate.toString(true)}</Text>
                <Text style={{ color: '#080' }}>{Utils.toStringDate(jdate.getDate(), true)}</Text>
            </View>
        </View>
    </View>;
}

const styles = StyleSheet.create({
    textSynopsisLabel: {
        marginBottom: 5
    },
    viewSynopsisContent: {
        flexDirection: 'row',
        padding: 4
    },
    iconContainer: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
});