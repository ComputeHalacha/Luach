import React, { Component } from 'react';
import { ScrollView, View, Alert, TouchableHighlight } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { List, ListItem, Icon } from 'react-native-elements';
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

        const { appData, onUpdate } = this.props.navigation.state.params;

        this.onUpdate = onUpdate;
        this.state = {
            appData: appData,
            possibleKavuahList: []
        };
    }
    componentWillMount() {
        const appData = this.state.appData;
        if (appData) {
            //Get all Kavuahs in the database that are active and are not ignored.
            const klist = appData.KavuahList.filter(k => k.active && !k.ignore),
                //Find all possible Kavuahs.
                plist = Kavuah.getKavuahSuggestionList(appData.EntryList.list)
                    //Filter out any Kavuahs that are already in the active list.
                    .filter(pk =>
                        !(klist.find(k => k.isMatchingKavuah(pk.kavuah)))
                    );
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
            kList = appData.KavuahList,
            foundInList = kList.find(k => k.isMatchingKavuah(pk.kavuah)),
            kavuah = foundInList || pk.kavuah;

        //In case it was already in the list, but was inactive or ignored.
        kavuah.active = true;
        kavuah.ignore = false;

        DataUtils.KavuahToDatabase(kavuah).then(() => {
            if (!foundInList) {
                kList.push(pk.kavuah);
            }
            appData.KavuahList = kList;
            //Now that it's been added to the database, it is no longer a "possible"" Kavuah.
            this.deletePossibleKavuah(pk);
            this.setState({ appData: appData });
            if (this.onUpdate) {
                this.onUpdate(appData);
            }
            Alert('The kavuah has been added to the list');
        });
    }
    deletePossibleKavuah(pk) {
        let list = this.state.possibleKavuahList,
            index = list.indexOf(pk);
        if (index > -1) {
            list.splice(index, 1);
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
                                <View style={[GeneralStyles.buttonList, { margin: 15 }]}>
                                    <TouchableHighlight
                                        underlayColor='#aaf'
                                        style={{ flex: 1 }}
                                        onPress={() => this.addKavuah.bind(this)(pk)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Icon
                                                name='add'
                                                color='#aaf'
                                                size={25} />
                                            <Text> Add</Text>
                                        </View>
                                    </TouchableHighlight>
                                    <TouchableHighlight
                                        underlayColor='#faa'
                                        style={{ flex: 1 }}
                                        onPress={() => this.deletePossibleKavuah.bind(this)(pk)}>
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