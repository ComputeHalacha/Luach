import React, { Component } from 'react';
import { ScrollView, View, Alert, Switch, Text, TouchableHighlight } from 'react-native';
import { List, ListItem, Icon } from 'react-native-elements';
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
    save(kavuah, name, value) {
        const appData = this.state.appData,
            kav = appData.KavuahList.find(k => k === kavuah);
        kav[name] = value;
        DataUtils.KavuahToDatabase(kav).then(() => {
            this.update(appData);
        });
    }
    render() {
        return (
            <ScrollView style={GeneralStyles.container}>
                <View style={GeneralStyles.buttonList}>
                    <View style={{ alignItems: 'center' }}>
                        <Icon
                            reverse
                            name='search'
                            color='#ddf'
                            onPress={this.findKavuahs.bind(this)} />
                        <Text>Calculate Possible Kavuahs</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Icon
                            reverse
                            name='add'
                            color='#9d9'
                            onPress={this.newKavuah.bind(this)} />
                        <Text>New Kavuah</Text>
                    </View>
                </View>
                <List>
                    {this.state.kavuahList.map((kavuah, index) => (
                        <ListItem
                            key={index}
                            title={kavuah.toLongString()}
                            leftIcon={{ name: 'device-hub' }}
                            hideChevron
                            subtitle={
                                <View style={[GeneralStyles.buttonList, { margin: 15 }]}>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                        <Text>Active </Text>
                                        <Switch value={kavuah.active}
                                            onValueChange={value =>
                                                this.save.bind(this)(kavuah, 'active', value)}
                                            title='Active' />
                                    </View>
                                    <TouchableHighlight
                                        underlayColor='#faa'
                                        style={{ flex: 1 }}
                                        onPress={() => this.deleteKavuah.bind(this)(kavuah)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Icon
                                                name='delete-forever'
                                                color='#faa'
                                                size={25} />
                                            <Text> Remove</Text>
                                        </View>
                                    </TouchableHighlight>
                                </View>} />
                    ))}
                </List>
            </ScrollView>);
    }
}