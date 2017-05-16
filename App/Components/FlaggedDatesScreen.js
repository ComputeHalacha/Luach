import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import GestureRecognizer from 'react-native-swipe-gestures';
import SideMenu from './SideMenu';
import CustomList from './CustomList';
import JDate from '../Code/JCal/jDate';
import { GeneralStyles } from './styles';

export default class FlaggedDatesScreen extends Component {
    static navigationOptions = {
        title: 'Flagged Dates',
    };
    constructor(props) {
        super(props);

        const { params } = this.props.navigation.state,
            appData = params.appData;

        this.jdate = params.jdate || new JDate();
        this.isToday = (!params.jdate);
        this.onUpdate = params.onUpdate;
        this.navigate = this.props.navigation.navigate;
        this.state = {
            appData: appData,
            problemOnahs: appData.ProblemOnahs.filter(o => {
                if (this.isToday) {
                    return o.jdate.Abs >= this.jdate.Abs;
                }
                else {
                    return o.jdate.Abs === this.jdate.Abs;
                }
            }),
            menuWidth: 50
        };
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
        this.goToDate = this.goToDate.bind(this);
    }
    hideMenu() {
        this.setState({ menuWidth: 0 });
    }
    showMenu() {
        this.setState({ menuWidth: 50 });
    }
    goToDate(jdate) {
        this.navigate('Home', { currDate: jdate, appData: this.state.appData });
    }
    render() {
        return (
            <View style={GeneralStyles.container}>
                <GestureRecognizer style={{ flexDirection: 'row', flex: 1 }}
                    onSwipeLeft={this.hideMenu}
                    onSwipeRight={this.showMenu}>
                    <SideMenu
                        width={this.state.menuWidth}
                        onUpdate={this.onUpdate}
                        appData={this.state.appData}
                        navigate={this.navigate}
                        hideOccasions={true} />
                    <ScrollView style={{ flex: 1 }}>
                        {(!this.isToday) &&
                            <View style={GeneralStyles.headerView}>
                                <Text style={GeneralStyles.headerText}>
                                    {this.jdate.toString()}</Text>
                            </View>
                        }
                        <CustomList
                            data={this.state.problemOnahs}
                            nightDay={po => po.nightDay}
                            emptyListText='There are no upcoming flagged dates'
                            secondSection={po => <View style={GeneralStyles.inItemButtonList}>
                                <TouchableHighlight
                                    underlayColor='#faa'
                                    style={{ flex: 1 }}
                                    onPress={() => this.goToDate(po.jdate)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Icon
                                            name='event-note'
                                            color='#393'
                                            size={25} />
                                        <Text> Go to Date</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>} />
                    </ScrollView>
                </GestureRecognizer>
            </View>);
    }
}