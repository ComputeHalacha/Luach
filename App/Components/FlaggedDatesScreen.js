import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableHighlight, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import CustomList from './CustomList';
import JDate from '../Code/JCal/jDate';
import { GeneralStyles } from './styles';
import { NightDay } from '../Code/Chashavshavon/Onah';

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
                {(this.state.problemOnahs && this.state.problemOnahs.length &&
                    <CustomList
                        dataSource={this.state.problemOnahs}
                        mainViewStyle={po => {
                            return { backgroundColor: po.nightDay === NightDay.Night ? '#ddd' : '#fff' };
                        }}
                        iconName={po =>
                            po.nightDay === NightDay.Night ? 'ios-moon' : 'ios-sunny'}
                        iconType='ionicon'
                        iconStyle={po =>
                            po.nightDay === NightDay.Night ? {} : { fontSize: 34 }}
                        iconColor={po =>
                            po.nightDay === NightDay.Night ? 'orange' : '#fff100'}
                        buttonSection={po =>
                            <View style={[GeneralStyles.buttonList, { margin: 15 }]}>
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
                            </View>} />)
                    ||
                    <View style={GeneralStyles.emptyListView}>
                        <Text style={GeneralStyles.emptyListText}>There are no upcoming flagged dates</Text>
                        <Image source={require('../Images/logo.png')} resizeMode='contain' style={GeneralStyles.emptyListImage} />
                    </View>
                }
            </ScrollView>);
    }
}