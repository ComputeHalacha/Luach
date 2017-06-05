import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import SideMenu from './SideMenu';
import CustomList from './CustomList';
import JDate from '../Code/JCal/jDate';
import Utils from '../Code/JCal/Utils';
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
                    return Utils.isSameJdate(o.jdate, this.jdate);
                }
            })
        };
        this.goToDate = this.goToDate.bind(this);
    }
    goToDate(jdate) {
        this.navigate('Home', { currDate: jdate, appData: this.state.appData });
    }
    render() {
        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.onUpdate}
                        appData={this.state.appData}
                        navigator={this.props.navigation}
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
                                    <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
                                        <Text style={[GeneralStyles.inItemLinkText, {
                                            color: '#585',
                                            padding: 3
                                        }]}>Go to Date</Text>
                                        <Icon
                                            name='event-note'
                                            color='#585'
                                            size={15} />

                                    </View>
                                </TouchableHighlight>
                            </View>} />
                    </ScrollView>
                </View>
            </View>);
    }
}