import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { GeneralStyles } from './styles';

export default class DateDetailsScreen extends React.Component {
    static navigationOptions = {
        title: (navigation, childRouter) => {
            return navigation.state.params.jdate.toShortString(true);
        },
    };
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
            <Text style={GeneralStyles.header}>{'Zmanim for ' + this.state.location.Name}</Text>
            <View>
                <List>
                    {list.map((item, index) => (
                        <ListItem key={index}
                            title={item.title}
                            titleStyle={item.important ? { fontWeight: 'bold', color: '#008' } : null}
                            hideChevron
                            label={<Text>{item.value}</Text>} />
                    ))}
                </List>
            </View>
        </ScrollView>;
    }
}