import React from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';

export default class DateDetailsScreen extends React.Component {
    static navigationOptions = {
        title: (navigation, childRouter) => {
            return navigation.state.params.jdate.toString();
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
        return <ScrollView style={styles.container}>
            {list.map((item, index) => (
                <View key={index}>
                    <Text style={item.important ? { fontWeight: 'bold' } : null}>
                        {item.title + (item.value ? ' ---- ' + item.value : '')}</Text>
                </View>
            ))}
        </ScrollView>;
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
});