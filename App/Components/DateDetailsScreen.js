import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { List, ListItem } from 'react-native-elements';


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
        return <View style={styles.container}>
            <Text style={styles.header}>{'Zmanim for ' + this.state.location.Name}</Text>
            <View style={{ flex: 1 }}>
                <List style={{ flex: 1 }}>
                    {list.map((item, index) => (
                        <ListItem key={index}
                            title={item.title}
                            titleStyle={item.important ? { fontWeight: 'bold', color: '#008' } : null}
                            hideChevron
                            label={<Text>{item.value}</Text>} />
                    ))}
                </List>
            </View>
        </View>;
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: {
        backgroundColor: '#fe9', color: '#977', padding: 5, flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 14
    },

});