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
            appData = params.appData,
            todayAbs = JDate.absSd(new Date());
        this.navigate = this.props.navigation.navigate;
        this.state = {
            appData: appData,
            problemOnahs: appData.ProblemOnahs.filter(o => o.jdate.Abs >= todayAbs)
        };
    }
    render() {
        return (
            <ScrollView style={GeneralStyles.container}>
                <CustomList
                    dataSource={this.state.problemOnahs}
                    nightDay={po => po.nightDay}
                    emptyListText='There are no upcoming flagged dates'
                    secondSection={<View style={[GeneralStyles.buttonList, { margin: 15 }]}>
                        <TouchableHighlight
                            underlayColor='#faa'
                            style={{ flex: 1 }}
                            onPress={() => this.navigate('Home', { currDate: o.jdate, appData: this.state.appData })}>
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