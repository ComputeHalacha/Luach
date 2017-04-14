import React, { Component } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, ListItem, Icon, Button } from 'react-native-elements';
import DataUtils from '../Code/Data/DataUtils';

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
    deleteKavuah(kavuah) {
        DataUtils.DeleteKavuah(kavuah).then(() => {
            const appData = this.state.appData;
            let kavuahList = appData.KavuahList,
                index = kavuahList.indexOf(kavuah);
            if (index > -1) {
                kavuahList = kavuahList.splice(index, 1);
                appData.KavuahList = kavuahList;
                this.setState({
                    appData: appData,
                    kavuahList: appData.KavuahList
                });
            }
        }
        ).catch(error => {
            console.warn('Error trying to delete a kavuah from the database.');
            console.error(error);
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
                            leftIcon={{ name: 'device-hub' }}
                            hideChevron
                            subtitle={
                                <View>
                                    <Button
                                        title='Remove'
                                        icon={{name:'delete-forever'}}
                                        backgroundColor='#f50'
                                        onPress={() => this.deleteKavuah.bind(this)(kavuah)} />
                                </View>} />
                    ))}
                </List>
            </ScrollView>);
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' }
});