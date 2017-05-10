import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableHighlight, Image, Modal, TextInput } from 'react-native';
import { Icon, Grid } from 'react-native-elements';
import { Today, getScreenWidth, isSmallScreen } from '../Code/GeneralUtils';
import jDate from '../Code/JCal/jDate';
import Utils from '../Code/JCal/Utils';
import Location from '../Code/JCal/Location';
import AppData from '../Code/Data/AppData';
import { UserOccasion } from '../Code/JCal/UserOccasion';
import { GeneralStyles } from './styles';

class Month {
    /**
     * @param {jDate | Date} date
     */
    constructor(date) {
        this.date = date;
        this.isJdate = date instanceof jDate;
    }
    toString() {
        if (this.isJdate) {
            return Utils.jMonthsEng[this.date.Month] + ' ' +
                this.date.Year.toString();
        }
        else {
            return Utils.sMonthsEng[this.date.getMonth()] + ' ' +
                this.date.getFullYear().toString();
        }
    }
    prev() {
        if (this.isJdate) {
            return this.date.addMonths(-1);
        }
        else {
            return this.date.setMonth(-1);
        }
    }
    next() {
        if (this.isJdate) {
            return this.date.addMonths(1);
        }
        else {
            return this.date.setMonth(1);
        }
    }
}

export default class MonthViewScreen extends React.Component {
    static navigationOptions = () => ({
        title: 'View Full Month'
    });
    constructor(props) {
        super(props);

        this.navigate = props.navigation.navigate;
    }
    render() {
        return <View>
            <Text style={GeneralStyles.header}>{this.state.month.name()}</Text>
        </View>;
    }
}