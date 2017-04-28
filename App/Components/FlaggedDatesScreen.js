import React, { Component } from 'react';
import { ScrollView, Text } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import JDate from '../Code/JCal/jDate';
import { GeneralStyles } from './styles';
import { NightDay } from '../Code/Chashavshavon/Onah';

export default class FlaggedDatesScreen extends Component {
    static navigationOptions = {
        title: 'Flagged Dates',
    };
    constructor(props) {
        super(props);

        const { params } = this.props.navigation.state,
            appData = params.appData,
            todayAbs = JDate.absSd(new Date());
        this.state = {
            problemOnahs: appData.ProblemOnahs.filter(o => o.jdate.Abs >= todayAbs)
        };
    }
    render() {
        return (
            <ScrollView style={GeneralStyles.container}>
                <Text style={GeneralStyles.header}>Upcoming Flagged Dates</Text>
                <List>
                    {this.state.problemOnahs.map((o, index) => {
                        const isNight = o.nightDay === NightDay.Night;
                        return (
                            <ListItem
                                key={index}
                                containerStyle={{ backgroundColor: isNight ? '#ddd' : '#fff' }}
                                title={o.toString()}
                                leftIcon={
                                    isNight ?
                                        { name: 'ios-moon', color: 'orange', type: 'ionicon' } :
                                        { name: 'ios-sunny', color: '#fff100', type: 'ionicon', style: { fontSize: 34 } }}

                                hideChevron
                            />
                        );
                    })}
                </List>
            </ScrollView>);
    }
}