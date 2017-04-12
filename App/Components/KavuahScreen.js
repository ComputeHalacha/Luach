import React, { Component } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { List, ListItem, Icon } from 'react-native-elements';

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
        this.state = {
            kavuahList: appData.KavuahList
        };

    }
    newKavuah() {
        this.navigate('NewKavuah', {
            appData: this.appData
        });
    }
    render() {
        return (
            <ScrollView style={styles.container}>
                <List>
                    {this.state.kavuahList.map(kavuah => (
                        <ListItem
                            key={kavuah.kavuahId}
                            title={kavuah.toString()}
                            leftIcon={{ name: 'device-hub' }} />
                    ))}
                </List>
            </ScrollView>);
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' }
});