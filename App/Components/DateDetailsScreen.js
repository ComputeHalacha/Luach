import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import CustomList from './CustomList';
import { GeneralStyles } from './styles';

export default class DateDetailsScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        title: navigation.state.params.jdate.toShortString(true)
    });

    constructor(props) {
        super(props);
        const navigation = this.props.navigation,
            { jdate, location } = navigation.state.params;
        this.navigate = navigation.navigate;
        this.state = { jdate: jdate, location: location };
    }
    render() {
        const list = this.state.jdate.getAllDetails(this.state.location);
        return <ScrollView style={GeneralStyles.container}>
            <View style={GeneralStyles.headerView}>
                <Text style={GeneralStyles.headerText}>{'Zmanim for ' + this.state.location.Name}</Text>
            </View>
            <CustomList
                data={list}
                textSectionViewStyle={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}
                title={i => i.title + (i.value ? ':' : '')}
                titleStyle={i => ({
                    fontWeight: 'bold',
                    color: i.important ? '#008' : null,
                    paddingRight: 10
                })}
                secondSection={i => <Text style={{ textAlign: 'right', flex: 1 }}>{i.value}</Text>} />
        </ScrollView>;
    }
}