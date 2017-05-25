import React from 'react';
import { Keyboard, StyleSheet, Image, Text, View, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import { getScreenHeight } from '../Code/GeneralUtils';
import jDate from '../Code/JCal/jDate';

/**
 * PROPS ******
 * navigate,
 * appData
 * onUpdate
 * currDate
 * isDataLoading
 * onGoToday - if falsey, will navigate to the home screen
 * onGoPrevious
 * onGoNext
 * hideToday
 * hideMonthView
 * hideFlaggedDates
 * hideEntries
 * hideKavuahs
 * hideSettings
 * hideOccasions
 */
export default class SideMenu extends React.Component {
    constructor(props) {
        super(props);

        this.navigate = (uri, propList) => {
            //Make sure that the keyboard is closed before going elsewhere
            Keyboard.dismiss();
            props.navigate(uri, propList);
        };
    }
    render() {
        const jdate = this.props.currDate || new jDate(),
            params = {
                appData: this.props.appData,
                onUpdate: this.props.onUpdate
            };
        return <View style={styles.mainView}>
            {(!this.props.hideToday) &&
                <TouchableHighlight
                    underlayColor='#eef'
                    onPress={this.props.onGoToday ||
                        (() => this.navigate('Home', { ...params, currDate: jdate }))}
                    style={styles.sideButton}>
                    <View style={styles.menuView}>
                        <Image
                            style={{ width: 25, height: 25 }}
                            resizeMode='stretch'
                            source={require('../Images/logo.png')} />
                        <Text style={styles.menuText}>Today</Text>
                    </View>
                </TouchableHighlight>
            }
            {this.props.onGoPrevious &&
                <TouchableHighlight
                    style={styles.sideButton}
                    underlayColor='#eef'
                    onPress={this.props.onGoPrevious}>
                    <View style={styles.menuView}>
                        <Icon iconStyle={styles.menuIcon} name='arrow-bold-up' type='entypo' />
                        <Text style={styles.menuText}>Previous</Text>
                    </View>
                </TouchableHighlight>
            }
            {this.props.onGoNext &&
                <TouchableHighlight
                    style={styles.sideButton}
                    underlayColor='#eef'
                    onPress={this.props.onGoNext}>
                    <View style={styles.menuView}>
                        <Icon iconStyle={styles.menuIcon} name='arrow-bold-down' type='entypo' />
                        <Text style={styles.menuText}>Next</Text>
                    </View>
                </TouchableHighlight>
            }
            {(!this.props.hideMonthView) &&
                <TouchableHighlight
                    underlayColor='#eef'
                    onPress={() => this.navigate('MonthView', { ...params, jdate: jdate })}
                    style={styles.sideButton}>
                    <View style={styles.menuView}>
                        <Icon iconStyle={styles.menuIcon} name='calendar' type='octicon' />
                        <Text style={styles.menuText}>Month</Text>
                    </View>
                </TouchableHighlight>
            }
            {(!this.props.hideFlaggedDates) &&
                <TouchableHighlight
                    style={styles.sideButton}
                    underlayColor='#eef'
                    onPress={() => {
                        if (!this.props.isDataLoading) this.navigate('FlaggedDates', params);
                    }}>
                    <View style={styles.menuView}>
                        <Icon iconStyle={styles.menuIcon} name='flag' />
                        <Text style={styles.menuText}>Dates</Text>
                    </View>
                </TouchableHighlight>
            }
            {(!this.props.hideEntries) &&
                <TouchableHighlight
                    style={styles.sideButton}
                    underlayColor='#eef'
                    onPress={() => {
                        if (!this.props.isDataLoading) this.navigate('Entries', {
                            ...params,
                            currLocation: (this.props.appData && this.props.appData.Settings && this.props.appData.Settings.location) || Location.getJerusalem()
                        });
                    }}>
                    <View style={styles.menuView}>
                        <Icon iconStyle={styles.menuIcon} name='list' />
                        <Text style={styles.menuText}>Entries</Text>
                    </View>
                </TouchableHighlight>
            }
            {(!this.props.hideKavuahs) &&
                <TouchableHighlight
                    style={styles.sideButton}
                    underlayColor='#eef'
                    onPress={() => {
                        if (!this.props.isDataLoading) this.navigate('Kavuahs', params);
                    }}>
                    <View style={styles.menuView}>
                        <Icon iconStyle={styles.menuIcon} name='device-hub' />
                        <Text style={styles.menuText}>Kavuahs</Text>
                    </View>
                </TouchableHighlight>
            }
            {(!this.props.hideOccasions) &&
                <TouchableHighlight
                    style={styles.sideButton}
                    underlayColor='#eef'
                    onPress={() => {
                        if (!this.props.isDataLoading) this.navigate('Occasions', params);
                    }}>
                    <View style={styles.menuView}>
                        <Icon iconStyle={styles.menuIcon} name='event' />
                        <Text style={styles.menuText}>Events</Text>
                    </View>
                </TouchableHighlight>
            }
            {(!this.props.hideSettings) &&
                <TouchableHighlight
                    style={styles.sideButton}
                    underlayColor='#eef'
                    onPress={() => {
                        if (!this.props.isDataLoading) this.navigate('Settings', params);
                    }}>
                    <View style={styles.menuView}>
                        <Icon iconStyle={styles.menuIcon} name='settings' />
                        <Text style={styles.menuText}>Settings</Text>
                    </View>
                </TouchableHighlight>
            }
        </View>;
    }
}

const styles = StyleSheet.create({
    mainView: {
        minWidth: 50,
        width: '15%',
        minHeight: Math.trunc(getScreenHeight() * 0.8),
        flex: -1,
        borderRightWidth: 1,
        borderColor: '#777',
        padding: 0,
        margin: 0
    },
    sideButton: {
        flex: 1
    },
    menuView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderColor: '#888',
        backgroundColor: '#666',
        paddingTop: 5,
        paddingBottom: 5,
        width: '100%'
    },
    menuText: {
        fontSize: 10,
        color: '#eee',
        textAlign: 'center',
        flexWrap: 'wrap'
    },
    menuIcon: {
        fontSize: 20,
        color: '#eee'
    }
});
