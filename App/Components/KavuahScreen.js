import React, { Component } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { List, ListItem, Icon, Button } from 'react-native-elements';
import DataUtils from '../Code/Data/DataUtils';
import { GeneralStyles } from './styles';

export default class KavuahScreen extends Component {
    static navigationOptions = {
        title: 'List of Kavuahs',
        right: <Icon name='add-circle' onPress={this.newKavuah} />,
    };
    constructor(props) {
        super(props);

        this.navigate = this.props.navigation.navigate;

        const { params } = this.props.navigation.state,
            appData = params.appData;
        this.onUpdate = params.onUpdate;
        this.state = {
            appData: appData,
            kavuahList: appData.KavuahList
        };
    }
    update(appData) {
        if (this.onUpdate) {
            this.onUpdate(appData);
        }
        this.setState({
            appData: appData,
            kavuahList: appData.KavuahList
        });
    }
    newKavuah() {
        this.navigate('NewKavuah', {
            appData: this.state.appData,
            onUpdate: this.update.bind(this)
        });
    }
    deleteKavuah(kavuah) {
        const appData = this.state.appData;
        let kavuahList = appData.KavuahList,
            index = kavuahList.indexOf(kavuah);
        if (index > -1 || kavuah.hasId) {
            Alert.alert(
                'Confirm Kavuah Removal',
                'Are you sure that you want to remove this Kavuah?',
                [   //Button 1
                    {
                        text: 'Cancel',
                        onPress: () => { return; },
                        style: 'cancel'
                    },
                    //Button 2
                    {
                        text: 'OK', onPress: () => {
                            if (kavuah.hasId) {
                                DataUtils.DeleteKavuah(kavuah).catch(error => {
                                    if (__DEV__) {
                                        console.warn('Error trying to delete a kavuah from the database.');
                                        console.error(error);
                                    }
                                });
                            }
                            if (index > -1) {
                                kavuahList.splice(index, 1);
                                appData.KavuahList = kavuahList;
                                this.update.bind(this)(appData);
                            }
                            Alert.alert('Remove kavuah',
                                `The kavuah of ${kavuah.toString()} has been successfully removed.`);
                        }
                    }
                ]);
        }
    }
    findKavuahs() {
        this.navigate('FindKavuahs', {
            appData: this.state.appData,
            onUpdate: this.update.bind(this)
        });
    }
    render() {
        return (
            <ScrollView style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row' }}>
                    <Icon
                        reverse
                        name='search'
                        color='#668'
                        onPress={this.findKavuahs.bind(this)} />
                    <Icon
                        reverse
                        name='add'
                        color='#686'
                        onPress={this.newKavuah.bind(this)} />
                </View>
                <List>
                    {this.state.kavuahList.map((kavuah, index) => (
                        <ListItem
                            key={index}
                            title={kavuah.toLongString()}
                            leftIcon={{ name: 'device-hub' }}
                            hideChevron
                            subtitle={
                                <View>
                                    <Icon
                                        name='delete-forever'
                                        color='#f44'
                                        size={20}
                                        onPress={() => this.deleteKavuah.bind(this)(kavuah)} />
                                </View>} />
                    ))}
                </List>
            </ScrollView>);
    }
}