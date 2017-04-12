import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import Utils from '../Code/JCal/Utils';

const Prob = props =>
    (<View style={styles.probView}>
        <Icon name='flag' color={props.real ? '#f00' : '#888'} />
        <Text style={[styles.probList, { color: props.real ? '#f00' : '#888' }]}>{props.text}</Text>
    </View>);

/**
 * Display a single jewish date.
 */
export default class SingleDayDisplay extends Component {
    constructor(props) {
        super(props);
    }
    newEntry() {
        const { jdate, location, appData, navigate } = this.props;
        navigate('NewEntry', { jdate: jdate, location: location, appData: appData });
    }
    showDateDetails() {
        const { jdate, location, navigate } = this.props;
        navigate('DateDetails', { jdate: jdate, location: location });
    }
    render() {
        const { jdate, location, isToday } = this.props,
            sdate = jdate.getDate(),
            dailyInfos = jdate.getHolidays(location.Israel),
            dailyInfoText = dailyInfos.length ? <Text>{dailyInfos.join('\n')}</Text> : null,
            suntimes = jdate.getSunriseSunset(location),
            sunrise = suntimes && suntimes.sunrise ?
                Utils.getTimeString(suntimes.sunrise) : 'Sun does not rise',
            sunset = suntimes && suntimes.sunset ?
                Utils.getTimeString(suntimes.sunset) : 'Sun does not set',
            probs = this.props.problems,
            problemText = probs && probs.length ?
                probs.map((po, i) => <Prob key={i} real={true} text={po.toString()} />) :
                (<Prob text='There are no Flagged Dates.' />),
            todayText = isToday ? (<Text style={styles.todayText}>TODAY</Text>) : null;

        return (
            <View
                style={[styles.container, this.props.isToday ? { backgroundColor: '#eef' } : null]}>
                <TouchableWithoutFeedback onPress={this.showDateDetails.bind(this)}>
                    <View>
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
                        <Text style={styles.location}>{'Zmanim for ' + location.Name}</Text>
                        <Text>{'Sun Rises at ' + sunrise}</Text>
                        <Text>{'Sun sets at ' + sunset + '\n\n'}</Text>
                        <View>
                            {problemText}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <Button icon={{ name: 'add' }} style={{width:80}} title='New Entry' borderRadius={20} onPress={this.newEntry.bind(this)} />
            </View>
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
        padding: 20,
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
    probView: { flexDirection: 'row', marginBottom: 10 },
    probList: { color: '#762', fontSize: 14 }
});