import React, { Component } from 'react';
import { ScrollView, Text, View, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import GestureRecognizer from 'react-native-swipe-gestures';
import SideMenu from './SideMenu';
import CustomList from './CustomList';
import DataUtils from '../Code/Data/DataUtils';
import { popUpMessage } from '../Code/GeneralUtils';
import { GeneralStyles } from './styles';

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
            occasionList: appData.UserOccasions,
            menuWidth: 50
        };

        this.deleteOccasion = this.deleteOccasion.bind(this);
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
    }
    hideMenu() {
        this.setState({ menuWidth: 0 });
    }
    showMenu() {
        this.setState({ menuWidth: 50 });
    }
    deleteOccasion(occasion) {
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
                popUpMessage(`The ocassion ${occasion.title} has been successfully removed.`,
                    'Remove occasion');
            }
        }
        ).catch(error => {
            if (__DEV__) {
                console.warn('Error trying to delete an occasion from the database.');
                console.error(error);
            }
        });
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
                        <CustomList
                            data={this.state.occasionList}
                            iconName='list'
                            emptyListText='There are no Events in the list'
                            secondSection={occasion => <View style={GeneralStyles.inItemButtonList}>
                                <TouchableHighlight
                                    underlayColor='#faa'
                                    style={{ flex: 1 }}
                                    onPress={() => this.deleteOccasion(occasion)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Icon
                                            name='delete-forever'
                                            color='#faa'
                                            size={25} />
                                        <Text> Remove</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    underlayColor='#696'
                                    style={{ flex: 1 }}
                                    onPress={() => this.navigate('Home', { currDate: occasion.jdate, appData: this.state.appData })}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Icon
                                            name='event-note'
                                            color='#696'
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