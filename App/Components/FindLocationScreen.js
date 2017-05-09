import React, { Component } from 'react';
import { ScrollView, View, Text, Image, TextInput, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import Location from '../Code/JCal/Location';
import { setDefault } from '../Code/GeneralUtils';
import { GeneralStyles } from './styles';
import DataUtils from '../Code/Data/DataUtils';
import CustomList from './CustomList';

export default class FindLocation extends Component {
    static navigationOptions = {
        title: 'Choose your location',
    };
    constructor(props) {
        super(props);
        const { appData, onUpdate } = this.props.navigation.state.params;
        this.onUpdate = onUpdate;
        this.appData = appData;
        this.dispatch = this.props.navigation.dispatch;

        const loc = appData.Settings.location || Location.getJerusalem();
        this.locName = loc.Name;
        this.state = {
            list: [loc]
        };
        this.findLocation = this.findLocation.bind(this);
    }
    update(location) {
        const appData = this.appData;
        appData.Settings.location = location;
        if (this.onUpdate) {
            this.onUpdate(appData);
        }
        this.dispatch(NavigationActions.back());
    }
    findLocation(search) {
        if (search) {
            DataUtils.SearchLocations(search).then(list =>
                this.setState({ list: list })
            );
        }
    }
    render() {
        return <ScrollView style={GeneralStyles.container}>
            <View style={GeneralStyles.formRow}>
                <Text style={GeneralStyles.label}>Search Location List</Text>
                <TextInput style={GeneralStyles.textInput}
                    defaultValue={this.locName}
                    onChangeText={value => this.findLocation(value)} />
            </View>
            {this.state.list.length > 0 &&
                (<View>
                    <Text style={GeneralStyles.header}>Select a location...</Text>
                    {this.state.list.map(i => <View style={GeneralStyles.inItemButtonList}>
                        <TouchableHighlight
                            underlayColor='#afa'
                            style={{ flex: 1 }}
                            onPress={() => this.update(i)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon
                                    name='forward'
                                    color='#393'
                                    size={25} />
                                <Text> {i.Name}</Text>
                            </View>
                        </TouchableHighlight>
                    </View>)
                    }
                </View>)
                ||
                (<View style={GeneralStyles.emptyListView}>
                    <Text style={GeneralStyles.emptyListText}>
                        There are no Locations in the list that match your search...</Text>
                    <Image
                        source={require('../Images/logo.png')}
                        resizeMode='contain'
                        style={GeneralStyles.emptyListImage} />
                </View>)
            }
        </ScrollView>
    }
}