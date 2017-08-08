import React from 'react';
import { StyleSheet, ScrollView, View, Text, TextInput, Button, Alert, TouchableOpacity, Modal } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Icon } from 'react-native-elements';
import SideMenu from '../Components/SideMenu';
import OccasionTypeChooser from '../Components/OccasionTypeChooser';
import { UserOccasionTypes, UserOccasion } from '../../Code/JCal/UserOccasion';
import DataUtils from '../../Code/Data/DataUtils';
import { popUpMessage, warn, error, buttonColor } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class NewOccasion extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const { occasion, appData, onUpdate } = navigation.state.params;
        return {
            title: (occasion ? 'Edit' : 'New') + ' Event / Occasion',
            headerRight: occasion &&
            <Icon name='delete-forever'
                color='#a33'
                size={20}
                onPress={() => NewOccasion.deleteOccasion(occasion, appData, ad => {
                    if (onUpdate) {
                        onUpdate(ad);
                    }
                    navigation.dispatch(NavigationActions.back());
                })} />
        };
    };
    constructor(props) {
        super(props);
        const navigation = this.props.navigation;
        let { appData, onUpdate, jdate, occasion } = navigation.state.params;
        this.onUpdate = onUpdate;
        this.dispatch = navigation.dispatch;
        if (occasion) {
            this.occasion = occasion;
            this.state = {
                appData: appData,
                jdate: occasion.jdate,
                occasionType: occasion.occasionType,
                title: occasion.title,
                color: occasion.color,
                comments: occasion.comments,
                modalVisible: false
            };
        }
        else {
            this.state = {
                appData: appData,
                jdate: jdate,
                occasionType: UserOccasionTypes.OneTime,
                title: '',
                color: UserOccasion.defaultColor,
                comments: '',
                modalVisible: false
            };
        }
        this.addOccasion = this.addOccasion.bind(this);
        this.updateOccasion = this.updateOccasion.bind(this);
        this.chooseColor = this.chooseColor.bind(this);
    }
    addOccasion() {
        if (this.state.title.length < 1) {
            popUpMessage('Please enter the title of this Event or Occasion.',
                'Add occasion');
            return;
        }
        const ad = this.state.appData,
            occasion = new UserOccasion(
                this.state.title,
                this.state.occasionType,
                this.state.jdate.Abs,
                this.state.color,
                this.state.comments);
        ad.UserOccasions.push(occasion);
        this.setState({ appData: ad });
        DataUtils.UserOccasionToDatabase(occasion).then(() => {
            if (this.onUpdate) {
                this.onUpdate(ad);
            }
            popUpMessage(`The occasion ${occasion.title} has been successfully added.`,
                'Add occasion');
            this.dispatch(NavigationActions.back());
        }).catch(err => {
            warn('Error trying to add a User Occasion in the database.');
            error(err);
            popUpMessage('We are sorry, Luach is unable to add this Occasion.\nPlease contact luach@compute.co.il.');
        });
    }
    updateOccasion() {
        if (this.state.title.length < 1) {
            popUpMessage('Please enter the title of this Event or Occasion.',
                'Add occasion');
            return;
        }
        const ad = this.state.appData,
            occasion = this.occasion;

        occasion.title = this.state.title;
        occasion.occasionType = this.state.occasionType;
        occasion.color = this.state.color;
        occasion.comments = this.state.comments;

        DataUtils.UserOccasionToDatabase(occasion).then(() => {
            if (this.onUpdate) {
                this.onUpdate(ad);
                popUpMessage(`The occasion ${occasion.title} has been successfully saved.`,
                    'Edit occasion');
                this.dispatch(NavigationActions.back());
            }
        }).catch(err => {
            warn('Error trying to add save the changes to User Occasion in the database.');
            error(err);
            popUpMessage('We are sorry, Luach is unable to save the changes to this Occasion.\nPlease contact luach@compute.co.il.');
        });
    }
    /**
     * Remove the given UserOccasion from the database and from the given appData UserOccasions list.
     * @param {UserOccasion} occasion
     * @param {AppData} appData
     * @param {Function} onUpdate
     */
    static deleteOccasion(occasion, appData, onUpdate) {
        Alert.alert(
            'Confirm Event Removal', 'Are you sue that you want to remove this Event?', [
                //Button 1
                {
                    text: 'Cancel',
                    onPress: () => { return; },
                    style: 'cancel'
                },
                //Button 2
                {
                    text: 'OK', onPress: () => {
                        DataUtils.DeleteUserOccasion(occasion).then(() => {
                            let occasionList = appData.UserOccasions,
                                index = occasionList.indexOf(occasion);
                            if (index > -1) {
                                occasionList.splice(index, 1);
                                appData.UserOccasions = occasionList;
                                if (onUpdate) {
                                    onUpdate(appData);
                                }
                                popUpMessage(`The Event ${occasion.title} has been successfully removed.`,
                                    'Remove Event');
                            }
                        }
                        ).catch(err => {
                            warn('Error trying to delete an Event from the database.');
                            error(err);
                            popUpMessage('We are sorry, Luach is unable to remove this Event.\nPlease contact luach@compute.co.il.');
                        });
                    }
                }]);
    }
    chooseColor(color) {
        this.setState({ color: color, modalVisible: false });
    }
    render() {
        const sdate = this.state.jdate.getDate(),
            muxedDate = `${this.state.jdate.toShortString(false)} (${sdate.toLocaleDateString()})`;
        return <View style={GeneralStyles.container}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <SideMenu
                    onUpdate={this.onUpdate}
                    appData={this.state.appData}
                    navigator={this.props.navigation}
                    currDate={this.props.jdate}
                    helpUrl='Events.html'
                    helpTitle='Events' />
                <ScrollView style={{ flex: 1 }}>
                    <View style={GeneralStyles.headerView}>
                        <Text style={GeneralStyles.headerText}>
                            {muxedDate}</Text>
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Event/Occasion Title</Text>
                        <TextInput style={GeneralStyles.textInput}
                            autoFocus
                            placeholder='Occasion Title'
                            onEndEditing={event =>
                                this.setState({ title: event.nativeEvent.text })}
                            defaultValue={this.state.title} />
                    </View>
                    <OccasionTypeChooser
                        jdate={this.state.jdate}
                        occasionType={this.state.occasionType || 0}
                        setOccasionType={value => this.setState({ occasionType: value })} />
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Background Color</Text>
                        <TouchableOpacity onPress={() => this.setState({ modalVisible: true })}>
                            <View style={[GeneralStyles.textInput, { backgroundColor: this.state.color }]}>
                            </View>
                        </TouchableOpacity>
                        <Modal
                            style={{ flex: 1 }}
                            transparent={true}
                            visible={this.state.modalVisible}
                            onRequestClose={() => this.setState({ modalVisible: false })}>
                            <View style={{
                                flex: 1,
                                backgroundColor: '#0009',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <View style={{
                                    backgroundColor: '#fff',
                                    flex: 0,
                                    width: 350,
                                    maxWidth: '90%'
                                }}>
                                    <View style={{
                                        backgroundColor: '#88a',
                                        paddingTop: 30,
                                        paddingBottom: 30,
                                        paddingLeft: 10,
                                        paddingRight: 10
                                    }}>
                                        <Text style={{
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            fontSize: 15,
                                            textAlign: 'center'
                                        }}>
                                            Choose Background Color
                                        </Text>
                                    </View>
                                    <View style={{ height: 50, flexDirection: 'row' }}>
                                        <ColorCell color={UserOccasion.defaultColor} chooseColor={this.chooseColor} />
                                        <ColorCell color={'#9b6'} chooseColor={this.chooseColor} />
                                        <ColorCell color={'#96b'} chooseColor={this.chooseColor} />
                                    </View>
                                    <View style={{ height: 50, flexDirection: 'row' }}>
                                        <ColorCell color={'#f00'} chooseColor={this.chooseColor} />
                                        <ColorCell color={'#090'} chooseColor={this.chooseColor} />
                                        <ColorCell color={'#00f'} chooseColor={this.chooseColor} />
                                    </View>
                                    <View style={{ height: 50, flexDirection: 'row' }}>
                                        <ColorCell color={'#707'} chooseColor={this.chooseColor} />
                                        <ColorCell color={'#770'} chooseColor={this.chooseColor} />
                                        <ColorCell color={'#077'} chooseColor={this.chooseColor} />
                                    </View>
                                    <View style={{
                                        alignItems: 'center',
                                        marginBottom: 10,
                                        marginTop: 10
                                    }}>
                                        <Button onPress={() =>
                                            this.setState({ modalVisible: false })} title='Close' />
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Comments</Text>
                        <TextInput style={[GeneralStyles.textInput, { height: 100 }]}
                            onEndEditing={event =>
                                this.setState({ comments: event.nativeEvent.text })}
                            defaultValue={this.state.comments}
                            placeholder='Enter any comments'
                            multiline={true}
                            maxLength={500} />
                    </View>
                    <View style={GeneralStyles.btnAddNew}>
                        <Button
                            title={this.occasion ? 'Save Changes' : 'Add Event / Occasion'}
                            onPress={this.occasion ? this.updateOccasion : this.addOccasion}
                            accessibilityLabel={this.occasion ?
                                'Save Changes to this Event' : 'Add this new Event'}
                            color={buttonColor} />
                    </View>
                </ScrollView>
            </View>
        </View>;
    }
}
function ColorCell(props) {
    return <TouchableOpacity style={{ flex: 1 }} onPress={() => props.chooseColor(props.color)}>
        <View style={[styles.colorCell, { backgroundColor: props.color }]}></View>
    </TouchableOpacity>;
}
const styles = StyleSheet.create({
    colorCell: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#aaa'
    },
});