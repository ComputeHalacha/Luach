import React, { Component } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { List, ListItem, Icon, Button } from 'react-native-elements';
import DataUtils from '../Code/Data/DataUtils';
import { Kavuah } from '../Code/Chashavshavon/Kavuah';
import { GeneralStyles } from './styles';

export default class FindKavuahScreen extends Component {
    static navigationOptions = {
        title: 'Calculate Kavuahs'
    };
    constructor(props) {
        super(props);

        this.dispatch = this.props.navigation.dispatch;

        const { params } = this.props.navigation.state,
            appData = params.appData;
        this.onUpdate = params.onUpdate;
        this.state = {
            appData: appData,
            possibleKavuahList: []
        };
    }
    componentWillMount() {
        const appData = this.state.appData;
        if (appData) {
            const plist = Kavuah.getKavuahSuggestionList(appData.EntryList.list);
            this.setState({ possibleKavuahList: plist });
            if (!plist.length) {
                Alert.alert(`The application did not find any Kavuah combinations.
                    Please remember: DO NOT RELY EXCLUSIVELY UPON THIS APPLICATION!`);
                this.dispatch(NavigationActions.back());
            }
        }
    }
    addKavuah(pk) {
        const appData = this.state.appData,
            kList = appData.KavuahList;
        DataUtils.KavuahToDatabase(pk.kavuah).then(() => {
            kList.push(pk.kavuah);
            appData.KavuahList = kList;
            this.setState({ appData: appData });
            if (this.onUpdate) {
                this.onUpdate(appData);
            }
            Alert('The kavuah has been added to the list');
            this.deletePossibleKavuah(pk);
        });
    }
    deletePossibleKavuah(pk) {
        let list = this.state.possibleKavuahList,
            index = list.indexOf(pk.kavuah);
        if (index > -1) {
            list = list.splice(index, 1);
            this.setState({
                possibleKavuahList: list
            });
        }
    }
    render() {
        return (
            <ScrollView style={GeneralStyles.container}>
                <List>
                    {this.state.possibleKavuahList.map((pk, index) => (
                        <ListItem
                            key={index}
                            title={pk.kavuah.toString()}
                            leftIcon={{ name: 'device-hub' }}
                            hideChevron
                            subtitle={
                                <View>
                                    <Button
                                        title='Add'
                                        icon={{ name: 'add' }}
                                        backgroundColor='#5f5'
                                        onPress={() => this.addKavuah.bind(this)(pk)} />
                                    <Button
                                        title='Remove'
                                        icon={{ name: 'delete-forever' }}
                                        backgroundColor='#f50'
                                        onPress={() => this.deletePossibleKavuah.bind(this)(pk)} />
                                </View>} />
                    ))}
                </List>
            </ScrollView>);
    }
}