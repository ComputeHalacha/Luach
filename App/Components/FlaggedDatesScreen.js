import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
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

        this.jdate = params.jdate || JDate.absSd(new Date());
        this.isToday = (!params.jdate);
        this.navigate = this.props.navigation.navigate;
        this.state = {
            appData: appData,
            problemOnahs: appData.ProblemOnahs.filter(o => {
                if (this.isToday) {
                    return o.jdate.Abs >= this.jdate;
                }
                else {
                    return o.jdate.Abs === this.jdate.Abs;
                }
            })
        };
    }
    render() {
        return (
            <ScrollView style={GeneralStyles.container}>
                {(!this.isToday) &&
                    <Text style={GeneralStyles.header}>{this.jdate.toString()}</Text>}
                <CustomList
                    data={this.state.problemOnahs}
                    nightDay={po => po.nightDay}
                    emptyListText='There are no upcoming flagged dates'
                    secondSection={po => <View style={GeneralStyles.inItemButtonList}>
                        <TouchableHighlight
                            underlayColor='#faa'
                            style={{ flex: 1 }}
                            onPress={() => this.navigate('Home', { currDate: po.jdate, appData: this.state.appData })}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon
                                    name='event-note'
                                    color='#393'
                                    size={25} />
                                <Text> Go to Date</Text>
                            </View>
                        </TouchableHighlight>
                    </View>} />
            </ScrollView>);
    }
}