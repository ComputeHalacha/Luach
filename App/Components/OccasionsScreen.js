import React, { Component } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { List, ListItem, Button } from 'react-native-elements';
import DataUtils from '../Code/Data/DataUtils';


export default class OccasionsScreen extends Component {
    static navigationOptions = {
        title: 'List of Occasions',
    };
    constructor(props) {
        super(props);

        this.navigate = this.props.navigation.navigate;

        const { appData } = this.props.navigation.state.params;

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
                occasionList = occasionList.splice(index, 1);
                occasionList.calulateHaflagas();
                appData.UserOccasions = occasionList;
                this.setState({
                    appData: appData,
                    occasionList: appData.UserOccasions
                });
                Alert.alert('Remove occasion',
                    `The ocassion ${occasion.title} has been successfully removed.`);
            }
        }
        ).catch(error => {
            console.warn('Error trying to delete an occasion from the database.');
            console.error(error);
        });
    }
    render() {
        return (
            <ScrollView style={styles.container}>
                <List>
                    {this.state.occasionList.descending.map(occasion => (
                        <ListItem
                            key={occasion.occasionId}
                            title={occasion.toString()}
                            leftIcon={{ name: 'list' }}
                            hideChevron
                            subtitle={
                                <View style={styles.buttonList}>
                                    <Button
                                        title='Remove'
                                        icon={{ name: 'delete-forever' }}
                                        backgroundColor='#f50'
                                        onPress={() => this.deleteOccasion.bind(this)(occasion)} />
                                </View>}
                        />
                    ))}
                </List>
            </ScrollView>);
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' }
});