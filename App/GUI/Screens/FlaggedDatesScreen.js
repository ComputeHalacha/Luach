import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import SideMenu from '../Components/SideMenu';
import CustomList from '../Components/CustomList';
import JDate from '../../Code/JCal/jDate';
import Utils from '../../Code/JCal/Utils';
import { GeneralStyles } from '../styles';

export default class FlaggedDatesScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.state.params.jdate ?
                'Flagged Dates' : 'All Upcoming Flagged Dates'
        };
    };
    constructor(props) {
        super(props);

        const { params } = this.props.navigation.state,
            appData = params.appData,
            jdate = params.jdate || new JDate();
        //If jdate was supplied in the params, we display only that days FlaggedDates.
        //Otherwise, we will display all Flagged Dates from today onwards.
        this.isToday = (!params.jdate);
        this.onUpdate = params.onUpdate;
        this.navigate = this.props.navigation.navigate;
        this.state = {
            appData: appData,
            currDate: jdate
        };
        this.goToDate = this.goToDate.bind(this);
        this.goPrev = this.goPrev.bind(this);
        this.goNext = this.goNext.bind(this);
    }
    goToDate(jdate) {
        this.navigate('Home', { currDate: jdate, appData: this.state.appData });
    }
    goPrev() {
        const jdate = this.state.currDate;
        this.setState({ currDate: jdate.addDays(-1) });
    }
    goNext() {
        const jdate = this.state.currDate;
        this.setState({ currDate: jdate.addDays(1) });
    }
    render() {
        const problemOnahs = this.state.appData.ProblemOnahs.filter(o => {
            if (this.isToday) {
                return o.jdate.Abs >= this.state.currDate.Abs;
            }
            else {
                return Utils.isSameJdate(o.jdate, this.state.currDate);
            }
        });
        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.onUpdate}
                        appData={this.state.appData}
                        navigator={this.props.navigation}
                        hideOccasions={true}
                        onGoPrevious={!this.isToday && this.goPrev}
                        onGoNext={!this.isToday && this.goNext}
                        helpUrl='FlaggedDates.html'
                        helpTitle='Flagged Dates' />
                    <ScrollView style={{ flex: 1 }}>
                        {(!this.isToday) &&
                            <View style={GeneralStyles.headerView}>
                                <Text style={GeneralStyles.headerText}>
                                    {this.state.currDate.toString()}</Text>
                            </View>
                        }
                        <CustomList
                            data={problemOnahs}
                            nightDay={po => po.nightDay}
                            emptyListText={this.isToday ?
                                'There are no upcoming flagged dates' :
                                'There is nothing Flagged for ' + this.state.currDate.toString()}
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