import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import Utils from '../../Code/JCal/Utils';

export default function OnahSynopsis(props) {
    const jdate = props.jdate,
        isNight = props.isNight;

    return <View style={styles.viewSynopsis}>
        <Text style={styles.textSynopsisLabel}>
            Currently Selected Date and Onah
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
    viewSynopsis: {
        borderWidth: 1,
        borderColor: '#88c',
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: '10%',
        paddingRight: '10%',
        margin: 10,
        borderRadius: 10,
        alignSelf: 'center',
        alignItems:'center',
        backgroundColor:'#f4f4f5'
    },
    textSynopsisLabel: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom:5
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