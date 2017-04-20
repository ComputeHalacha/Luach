import React, { Component } from 'react';
import { Button, StyleSheet, Text, View, TouchableWithoutFeedback, Modal, TouchableHighlight } from 'react-native';
import { List, ListItem, Icon } from 'react-native-elements';
import Utils from '../Code/JCal/Utils';
import { NightDay } from '../Code/Chashavshavon/Onah';

/**
 * Display a single jewish date.
 */
export default class SingleDayDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = { popupVisible: false };
    }
    newEntry() {
        const { jdate, location, appData, navigate } = this.props;
        navigate('NewEntry', { jdate: jdate, location: location, appData: appData });
    }
    newOccasion() {
        const { jdate, onUpdate, appData, navigate } = this.props;
        navigate('NewOccasion', { jdate, onUpdate, appData });
    }
    showDateDetails() {
        const { jdate, location, navigate } = this.props;
        navigate('DateDetails', { jdate: jdate, location: location });
    }
    toggleModal() {
        this.setState({ popupVisible: !this.state.popupVisible });
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
            nightProbs = probs && probs.length && probs.filter(p => p.nightDay === NightDay.Night),
            dayProbs = probs && probs.length && probs.filter(p => p.nightDay === NightDay.Day),
            problemText = probs && probs.length ? (<View>
                <Icon name='flag' color={'#f00'} onPress={this.toggleModal.bind(this)} />
            </View>) : null,
            occasions = this.props.occasions,
            occasionText = occasions && occasions.length ?
                occasions.map((o, i) => <Text key={i}>{o.title}</Text>) : null,
            entries = this.props.entries,
            entriesText = entries && entries.length ?
                entries.map((e, i) => (<Text key={i}>{e.toKnownDateString()}</Text>)) : null,
            todayText = isToday ? (<Text style={styles.todayText}>TODAY</Text>) : null;

        return (
            <View
                style={[styles.container, {
                    backgroundColor:
                    (entries && entries.length ? '#fee' : (probs && probs.length ? '#fe9' : (isToday ? '#eef' : '#fff')))
                }]}>
                <Modal
                    animationType={'slide'}
                    transparent={true}
                    visible={this.state.popupVisible}
                    onRequestClose={this.toggleModal.bind(this)}>
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        padding: 20,
                        borderColor: '#444',
                        borderWidth: 1,
                        borderRadius: 6
                    }}>
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#fff'
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center'
                            }}>
                                <View style={{
                                    flex: 1,
                                    backgroundColor: nightProbs && nightProbs.length ? '#f1e8e8' : '#f1f1f1'
                                }}>
                                    <Text style={{ textAlign: 'center' }}>Night-Time</Text>
                                    <List>
                                        {nightProbs && nightProbs.map((p, i) => (
                                            <ListItem
                                                key={i}
                                                title={p.name}
                                                leftIcon={{ name: 'flag' }}
                                                hideChevron />
                                        ))}
                                    </List>
                                </View>
                                <View style={{
                                    flex: 1,
                                    backgroundColor: dayProbs && dayProbs.length ? '#fff1f1' : '#ffffff'
                                }}>
                                    <Text style={{ textAlign: 'center' }}>Day-Time</Text>
                                    <List>
                                        {dayProbs && dayProbs.map((p, i) => (
                                            <ListItem
                                                key={i}
                                                title={p.name}
                                                leftIcon={{ name: 'flag' }}
                                                hideChevron />
                                        ))}
                                    </List>
                                </View>
                            </View>
                        </View>
                        <Button onPress={this.toggleModal.bind(this)} title='Close' style={{ flex: 1 }} />
                    </View>
                </Modal>
                <View style={{ margin: 15 }}>
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
                                {occasionText}
                            </View>
                            <View>
                                {entriesText}
                            </View>
                            <View>
                                {problemText}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Button
                            color='#abf'
                            style={styles.btn}
                            accessibilityLabel='Add a new Entry'
                            title='New Entry'
                            onPress={this.newEntry.bind(this)} />
                        <Button
                            color='#fba'
                            style={styles.btn}
                            accessibilityLabel='Add a new Occasion for this date'
                            title='New Occasion'
                            onPress={this.newOccasion.bind(this)} />
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
    probView: { flexDirection: 'row', marginBottom: 10 },
    btn: { fontSize: 7, height: 25 }

});