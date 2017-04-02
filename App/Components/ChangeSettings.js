import React, { Component } from 'react';
import { View, StyleSheet, Text, Picker } from 'react-native';
import { Grid, Col, Row } from 'react-native-elements/src';
import Location from '../Code/JCal/Location';

export default class MonthView extends Component {
    constructor(props) {
        super(props);
        this.state = { settings: this.props.Settings };
    }
    changeNumberMonthsAheadToWarn(num) {
        const sets = this.state.settings;
        sets.numberMonthsAheadToWarn = num;
        this.setState({ settings: sets });
    }
    render() {
        const nums = [];
        for (let i = 1; i < 24; i++) {
            nums.push(i);
        }
        const value = (this.state.settings && this.state.settings.numberMonthsAheadToWarn) || 12;
        return (
            <View>
                <Text>Number of Months ahead to warn</Text>
                <Picker selectedValue={value} onValueChange={this.changeNumberMonthsAheadToWarn.bind(this)}>
                    {nums.map((n, i) => {
                        return (<Picker.Item label={n.toString()} value={n} key={i} />);
                    })}
                </Picker>
            </View>);
    }
}

const styles = StyleSheet.create({

});
