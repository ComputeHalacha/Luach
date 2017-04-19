import React, { Component } from 'react';
import { ScrollView, Text } from 'react-native';
import { GeneralStyles } from './styles';

export default class FlaggedDatesScreen extends Component {
    static navigationOptions = {
        title: 'Flagged Dates',
    };
    constructor(props) {
        super(props);

        this.navigate = this.props.navigation.navigate;

        const { params } = this.props.navigation.state,
            appData = params.appData;
        this.state = {
            problemOnahs: appData.ProblemOnahs
        };
    }
    render() {
        return (
            <ScrollView style={GeneralStyles.container}>
                <Text style={GeneralStyles.header}>Flagged Dates</Text>
            </ScrollView>);
    }
}