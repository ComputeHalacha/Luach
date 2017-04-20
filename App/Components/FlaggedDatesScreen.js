import React, { Component } from 'react';
import { ScrollView, Text } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import JDate from '../Code/JCal/jDate';
import { GeneralStyles } from './styles';

export default class FlaggedDatesScreen extends Component {
    static navigationOptions = {
        title: 'Flagged Dates',
    };
    constructor(props) {
        super(props);

        this.navigate = this.props.navigation.navigate;

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
                    {this.state.problemOnahs.map((o, index) => (
                        <ListItem
                            key={index}
                            title={o.toString()}
                            leftIcon={{ name: 'flag', color:'red' }}
                            hideChevron
                        />
                    ))}
                </List>
            </ScrollView>);
    }
}