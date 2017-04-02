import React, { Component } from 'react';
import { StyleSheet, Text, View, ListView } from 'react-native';

export default class MainLists extends Component {
    constructor(props) {
        super(props);

    }
    renderListItem(item) {
        return (<View style={styles.li}>
            <View>
                <Text style={styles.liText}>{item}</Text>
            </View>
        </View>);
    }

    render() {
        const ds = new ListView.DataSource({ rowHasChanged: (row1, row2) => { row1 !== row2; } });
        return <View style={styles.container}>
            <View style={styles.listHeading}>
                <Text style={styles.listText}>{this.props.listName}</Text>
            </View>
            <ListView
                enableEmptySections={true}
                dataSource={ds.cloneWithRows(this.props.listItems)}
                renderRow={this.renderListItem}
                style={styles.liContainer} />
        </View>;
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        flex: 1
    },
    listHeading: {
        flexDirection: 'row',
        flex: 0,
        marginBottom: 0,
        backgroundColor: '#f5f5e8'
    },
    listText: {
        fontSize: 16,
        margin: 10,
        fontWeight: 'bold',
        color: '#977',
        textAlign: 'center',
        flex: 1

    },
    li: {
        borderBottomColor: '#c8c7cc',
        borderBottomWidth: 0.5,
        paddingTop: 15,
        paddingRight: 15,
        paddingBottom: 15
    },
    liContainer: {
        backgroundColor: '#F5FCFF',
        flex: 1,
        paddingLeft: 15
    },
    liText: {
        color: '#333',
        fontSize: 13,
        fontWeight: '400',
        marginBottom: -3.5,
        marginTop: -3.5
    }
});