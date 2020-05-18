import React from 'react';
import { ScrollView, View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Icon } from 'react-native-elements';
import DateTimePicker from 'react-native-modal-datetime-picker';
import SideMenu from '../Components/SideMenu';
import ColorChooser from '../Components/ColorChooser';
import OccasionTypeChooser from '../Components/OccasionTypeChooser';
import JdateChooser from '../Components/JdateChooser';
import { UserOccasionTypes, UserOccasion } from '../../Code/JCal/UserOccasion';
import jDate from '../../Code/JCal/jDate';
import Utils from '../../Code/JCal/Utils';
import DataUtils from '../../Code/Data/DataUtils';
import { popUpMessage, warn, error, inform, GLOBALS } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class NewOccasion extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const { occasion, appData, onUpdate } = navigation.state.params;
        return {
            title: (occasion ? 'Edit' : 'New') + ' Event / Occasion',
            headerRight: occasion && (
                <View style={{ flexDirection: 'row' }}>
                    {occasion.occasionType !== UserOccasionTypes.OneTime && (
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('Home', {
                                    currDate: occasion.getNextInstance(),
                                    appData: appData,
                                })
                            }>
                            <View
                                style={{
                                    alignItems: 'center',
                                    marginRight: 13,
                                }}>
                                <Icon
                                    name='near-me'
                                    color='#66a'
                                    size={18}
                                    containerStyle={GeneralStyles.inItemLinkIcon}
                                />
                                <Text
                                    style={{
                                        fontSize: 9,
                                        fontStyle: 'italic',
                                        textAlign: 'center',
                                        color: '#66a',
                                    }}>
                                    Upcoming
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() =>
                            NewOccasion.deleteOccasion(occasion, appData, (ad) => {
                                if (onUpdate) {
                                    onUpdate(ad);
                                }
                                navigation.dispatch(NavigationActions.back());
                            })
                        }>
                        <View
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 5,
                            }}>
                            <Icon name='delete-forever' color='#a33' size={20} />
                            <Text
                                style={{
                                    fontSize: 9,
                                    fontStyle: 'italic',
                                    color: '#a33',
                                }}>
                                Remove
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            ),
        };
    };
    constructor(props) {
        super(props);
        const navigation = this.props.navigation;
        let { appData, onUpdate, jdate, occasion } = navigation.state.params;
        this.onUpdate = onUpdate;
        this.dispatch = navigation.dispatch;
        this.appData = appData;
        if (occasion) {
            this.occasion = occasion;
            this.state = {
                jdate: occasion.jdate,
                occasionType: occasion.occasionType,
                title: occasion.title,
                color: occasion.color,
                comments: occasion.comments,
                showDatePicker: false,
                modalVisible: false,
            };
        } else {
            this.state = {
                jdate: jdate,
                occasionType: UserOccasionTypes.OneTime,
                title: '',
                color: UserOccasion.defaultColor,
                comments: '',
                showDatePicker: false,
                modalVisible: false,
            };
        }
        this.addOccasion = this.addOccasion.bind(this);
        this.updateOccasion = this.updateOccasion.bind(this);
        this.chooseColor = this.chooseColor.bind(this);
        this.changeSDate = this.changeSDate.bind(this);
    }
    async addOccasion() {
        if (this.state.title.length < 1) {
            inform('Please enter the title of this Event or Occasion.', 'Add occasion');
            return;
        }
        const occasion = new UserOccasion(
            this.state.title,
            this.state.occasionType,
            this.state.jdate.Abs,
            this.state.color,
            this.state.comments
        );
        try {
            this.appData.UserOccasions.push(await DataUtils.UserOccasionToDatabase(occasion));
            if (this.onUpdate) {
                this.onUpdate(this.appData);
            }
            popUpMessage(
                `The occasion ${occasion.title} has been successfully added.`,
                'Add occasion'
            );
            this.dispatch(NavigationActions.back());
        } catch (err) {
            warn('Error trying to add a User Occasion in the database.');
            error(err);
            popUpMessage(
                'We are sorry, Luach is unable to add this Occasion.\nPlease contact luach@compute.co.il.'
            );
        }
    }
    updateOccasion() {
        if (this.state.title.length < 1) {
            popUpMessage('Please enter the title of this Event or Occasion.', 'Add occasion');
            return;
        }
        const occasion = this.occasion,
            origValues = occasion.clone();

        occasion.jdate = this.state.jdate;
        occasion.title = this.state.title;
        occasion.occasionType = this.state.occasionType;
        occasion.color = this.state.color;
        occasion.comments = this.state.comments;

        DataUtils.UserOccasionToDatabase(occasion)
            .then(() => {
                popUpMessage(
                    `The occasion ${occasion.title} has been successfully saved.`,
                    'Edit occasion'
                );
                this.onUpdate(this.appData);
                this.dispatch(NavigationActions.back());
            })
            .catch((err) => {
                warn('Error trying to add save the changes to User Occasion in the database.');
                error(err);
                popUpMessage(
                    'We are sorry, Luach is unable to save the changes to this Occasion.\nPlease contact luach@compute.co.il.'
                );

                //Revert values
                occasion.title = origValues.title;
                occasion.occasionType = origValues.occasionType;
                occasion.jdate = origValues.jdate;
                occasion.color = origValues.color;
                occasion.comments = origValues.comments;
            });
    }
    /**
     * Remove the given UserOccasion from the database and from the given appData UserOccasions list.
     * @param {UserOccasion} occasion
     * @param {AppData} appData
     * @param {Function} onUpdate
     */
    static deleteOccasion(occasion, appData, onUpdate) {
        Alert.alert('Confirm Event Removal', 'Are you sue that you want to remove this Event?', [
            //Button 1
            {
                text: 'Cancel',
                onPress: () => {
                    return;
                },
                style: 'cancel',
            },
            //Button 2
            {
                text: 'OK',
                onPress: () => {
                    DataUtils.DeleteUserOccasion(occasion)
                        .then(() => {
                            let occasionList = appData.UserOccasions,
                                index = occasionList.indexOf(occasion);
                            if (index > -1) {
                                occasionList.splice(index, 1);
                                appData.UserOccasions = occasionList;
                                if (onUpdate) {
                                    onUpdate(appData);
                                }
                                popUpMessage(
                                    `The Event ${occasion.title} has been successfully removed.`,
                                    'Remove Event'
                                );
                            }
                        })
                        .catch((err) => {
                            warn('Error trying to delete an Event from the database.');
                            error(err);
                            popUpMessage(
                                'We are sorry, Luach is unable to remove this Event.\nPlease contact luach@compute.co.il.'
                            );
                        });
                },
            },
        ]);
    }
    chooseColor(color) {
        this.setState({ color: color, modalVisible: false });
    }
    changeSDate(sdate) {
        const jdate = new jDate(sdate);
        this.setState({ jdate, showDatePicker: false });
    }
    render() {
        const sdate = this.state.jdate.getDate(),
            muxedDate = `${this.state.jdate.toShortString(false)} (${sdate.toLocaleDateString()})`;
        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.onUpdate}
                        appData={this.appData}
                        navigator={this.props.navigation}
                        currDate={this.state.jdate}
                        helpUrl='Events.html'
                        helpTitle='Events'
                    />
                    <ScrollView style={{ flex: 1 }}>
                        <View style={GeneralStyles.headerView}>
                            <Text style={GeneralStyles.headerText}>{muxedDate}</Text>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Event/Occasion Title</Text>
                            <TextInput
                                style={GeneralStyles.textInput}
                                autoFocus
                                placeholder='Occasion Title'
                                onEndEditing={(event) =>
                                    this.setState({
                                        title: event.nativeEvent.text,
                                    })
                                }
                                defaultValue={this.state.title}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Jewish Date</Text>
                            <JdateChooser
                                jdate={this.state.jdate}
                                setDate={(jdate) => this.setState({ jdate })}
                            />
                        </View>
                        <View style={{ padding: 10 }}>
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: '#955',
                                }}>
                                You can choose by either Jewish or Secular Date
                            </Text>
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Secular Date</Text>
                            <View style={GeneralStyles.textInput}>
                                <TouchableOpacity
                                    onPress={() => this.setState({ showDatePicker: true })}>
                                    <Text>{Utils.toStringDate(sdate)}</Text>
                                </TouchableOpacity>
                                <DateTimePicker
                                    isVisible={this.state.showDatePicker}
                                    date={sdate}
                                    onConfirm={this.changeSDate}
                                    onCancel={() => this.setState({ showDatePicker: false })}
                                />
                            </View>
                        </View>
                        <OccasionTypeChooser
                            jdate={this.state.jdate}
                            occasionType={this.state.occasionType || 0}
                            setOccasionType={(value) => this.setState({ occasionType: value })}
                        />
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Background Color</Text>
                            <ColorChooser
                                caption='Choose Background Color'
                                color={this.state.color}
                                scheme='dark'
                                onChange={this.chooseColor}
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Comments</Text>
                            <TextInput
                                style={[GeneralStyles.textInput, { height: 100 }]}
                                onEndEditing={(event) =>
                                    this.setState({
                                        comments: event.nativeEvent.text,
                                    })
                                }
                                defaultValue={this.state.comments}
                                placeholder='Enter any comments'
                                multiline={true}
                                maxLength={500}
                            />
                        </View>
                        <View style={GeneralStyles.btnAddNew}>
                            <Button
                                title={this.occasion ? 'Save Changes' : 'Add Event / Occasion'}
                                onPress={this.occasion ? this.updateOccasion : this.addOccasion}
                                accessibilityLabel={
                                    this.occasion
                                        ? 'Save Changes to this Event'
                                        : 'Add this new Event'
                                }
                                color={GLOBALS.BUTTON_COLOR}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}
