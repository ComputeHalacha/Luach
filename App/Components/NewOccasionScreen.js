import React from 'react';
import { ScrollView, View, StyleSheet, Text, Picker, Switch, TextInput } from 'react-native';
import { Button } from 'react-native-elements';
import { UserOccasionType, UserOccasion } from '../Code/JCal/UserOccasion';
import DataUtils from '../Code/Data/DataUtils';
import Utils from '../Code/JCal/Utils';

export default class NewOccasion extends React.Component {
    static navigationOptions = {
        title: 'New Occasion',
    };
    constructor(props) {
        super(props);
        const navigation = this.props.navigation;
        let { appData, onUpdate, jdate } = navigation.state.params;
        this.onUpdate = onUpdate;
        this.navigate = navigation.navigate;
        this.state = {
            appData: appData,
            jdate: jdate,
            occasionType: UserOccasionType.OneTime,
            title: '',
            comment: ''
        };
    }
    addOccasion() {
        const ad = this.state.appData,
            occasion = new UserOccasion(
                this.state.title,
                this.state.occasionType,
                this.state.jdate.Abs,
                this.state.comment);
        ad.UserOccasions.push(occasion);
        this.setState({ appData: ad });
        DataUtils.UserOccasionToDatabase(occasion);
        this.onUpdate();
        this.navigate('Home', { appData: this.state.appData });
    }
    render() {
        const jmonthName = Utils.jMonthsEng[this.state.jdate.Month],
            jDay = Utils.toSuffixed(this.state.jdate.Day),
            sdate = this.state.jdate.getDate(),
            sMonthName = Utils.sMonthsEng[sdate.getMonth()],
            sDay = Utils.toSuffixed(sdate.getDate());
        return <ScrollView style={styles.container}>
            <Text style={styles.header}>New Occasion for {this.state.jdate.toString(false)}</Text>
            <View style={styles.formRow}>
                <Text style={styles.label}>Occasion Title</Text>
                <TextInput
                    autoFocus
                    placeholder='Occasion Title'
                    value={this.state.title}
                    onChangeText={(text) => this.setState({ title: text })} />
            </View>
            <View style={styles.formRow}>
                <Text style={styles.label}>Occasion Type</Text>
                <Picker style={styles.picker}
                    selectedValue={this.state.occasionType}
                    onValueChange={value => this.setState({ occasionType: value })}>
                    <Picker.Item label='One Time Occasion'
                        value={UserOccasionType.OneTime} />
                    <Picker.Item label={`Each ${jmonthName} ${jDay}`}
                        value={UserOccasionType.HebrewDateRecurringYearly} />
                    <Picker.Item label={`On the ${jDay} of each Jewish Month`}
                        value={UserOccasionType.HebrewDateRecurringMonthly} />
                    <Picker.Item label={`Each ${sMonthName} ${sDay}`}
                        value={UserOccasionType.SecularDateRecurringYearly} />
                    <Picker.Item label={`On the ${sDay} of each Secular Month`}
                        value={UserOccasionType.SecularDateRecurringMonthly} />suach} />
                </Picker>
            </View>
            <View style={styles.formRow}>
                <Text style={styles.label}>Comments</Text>
                <TextInput
                    multiline
                    placeholder='Comments'
                    value={this.state.comment}
                    onChangeText={(text) => this.setState({ comment: text })} />
            </View>

            <Text>{'\n'}</Text>
            <View style={styles.formRow}>
                <Button title='Add Occasion' onPress={this.addOccasion.bind(this)} />
            </View>
        </ScrollView>;
    }
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    formRow: { flex: 1, flexDirection: 'column' },
    label: { margin: 0, backgroundColor: '#f5f5e8', padding: 10 },
    picker: { margin: 0 },
    switch: { margin: 5, alignSelf: 'flex-start' }
});