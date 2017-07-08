import React, { Component } from 'react';
import { ScrollView, Text, View, TouchableHighlight, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import SideMenu from '../Components/SideMenu';
import CustomList from '../Components/CustomList';
import DataUtils from '../../Code/Data/DataUtils';
import { warn, error, popUpMessage } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class OccasionsScreen extends Component {
    static navigationOptions = {
        title: 'Events / Occasions',
    };
    constructor(props) {
        super(props);

        this.navigate = this.props.navigation.navigate;

        const { appData, onUpdate } = this.props.navigation.state.params;
        this.onUpdate = onUpdate;
        this.state = {
            appData: appData,
            occasionList: appData.UserOccasions
        };

        this.deleteOccasion = this.deleteOccasion.bind(this);
    }
    deleteOccasion(occasion) {
        Alert.alert(
            'Confirm Event Removal', 'Are you sue that you want to remove this Event?', [
                //Button 1
                {
                    text: 'Cancel',
                    onPress: () => { return; },
                    style: 'cancel'
                },
                //Button 2
                {
                    text: 'OK', onPress: () => {
                        DataUtils.DeleteUserOccasion(occasion).then(() => {
                            const appData = this.state.appData;
                            let occasionList = appData.UserOccasions,
                                index = occasionList.indexOf(occasion);
                            if (index > -1) {
                                occasionList.splice(index, 1);
                                appData.UserOccasions = occasionList;
                                if (this.onUpdate) {
                                    this.onUpdate(appData);
                                }
                                this.setState({
                                    appData: appData,
                                    occasionList: occasionList
                                });
                                popUpMessage(`The Event "${occasion.title}" has been successfully removed.`,
                                    'Remove Event');
                            }
                        }
                        ).catch(err => {
                            warn('Error trying to delete an occasion from the database.');
                            error(err);
                            popUpMessage('We are sorry, Luach is unable to remove this Event.\nPlease contact luach@compute.co.il.');
                        });
                    }
                }]);
    }
    render() {
        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.onUpdate}
                        appData={this.state.appData}
                        navigator={this.props.navigation}
                        hideOccasions={true}
                        helpUrl='Events.html'
                        helpTitle='Events' />
                    <ScrollView style={{ flex: 1 }}>
                        <CustomList
                            data={this.state.occasionList}
                            iconName='list'
                            emptyListText='There are no Events in the list'
                            secondSection={occasion => <View style={GeneralStyles.inItemButtonList}>
                                <TouchableHighlight
                                    underlayColor='#696'
                                    style={{ flex: 1 }}
                                    onPress={() => this.navigate('Home', {
                                        currDate: occasion.jdate,
                                        appData: this.state.appData
                                    })}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Icon
                                            name='event-note'
                                            color='#696'
                                            size={18}
                                            containerStyle={GeneralStyles.inItemLinkIcon} />
                                        <Text style={GeneralStyles.inItemLinkText}> Go to Date</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    underlayColor='#788778'
                                    style={{ flex: 1 }}
                                    onPress={() => this.navigate('NewOccasion', {
                                        occasion,
                                        appData: this.state.appData,
                                        onUpdate: this.onUpdate
                                    })}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Icon
                                            name='edit'
                                            color='#99a999'
                                            size={18}
                                            containerStyle={GeneralStyles.inItemLinkIcon} />
                                        <Text style={GeneralStyles.inItemLinkText}>Edit</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    underlayColor='#faa'
                                    style={{ flex: 1 }}
                                    onPress={() => this.deleteOccasion(occasion)}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Icon
                                            name='delete-forever'
                                            color='#faa'
                                            size={18}
                                            containerStyle={GeneralStyles.inItemLinkIcon} />
                                        <Text style={GeneralStyles.inItemLinkText}> Remove</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>} />
                    </ScrollView>
                </View>
            </View>);
    }
}