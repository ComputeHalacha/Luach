import React, { Component } from 'react';
import { ScrollView, Alert, Text, View, Image } from 'react-native';
import { List, ListItem, Button } from 'react-native-elements';
import DataUtils from '../Code/Data/DataUtils';
import { GeneralStyles } from './styles';

export default class OccasionsScreen extends Component {
    static navigationOptions = {
        title: 'List of Occasions',
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
                Alert.alert('Remove occasion',
                    `The ocassion ${occasion.title} has been successfully removed.`);
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
            <ScrollView style={GeneralStyles.container}>
                {(this.state.occasionList && this.state.occasionList.length &&
                    <List>
                        {this.state.occasionList.map(occasion => (
                            <ListItem
                                key={occasion.occasionId}
                                title={occasion.toString()}
                                leftIcon={{ name: 'list' }}
                                hideChevron
                                subtitle={
                                    <Button
                                        title='Remove'
                                        icon={{ name: 'delete-forever' }}
                                        backgroundColor='#fca'
                                        onPress={() => this.deleteOccasion.bind(this)(occasion)} />
                                }
                            />
                        ))}
                    </List>)
                    ||
                    <View style={GeneralStyles.emptyListView}>
                        <Text style={GeneralStyles.emptyListText}>There are no Occasions in the list</Text>
                        <Image source={require('../Images/logo.png')} />
                    </View>
                }
            </ScrollView>);
    }
}