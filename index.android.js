import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, ListView } from 'react-native';
import './App/Code/initAndroid';
import SingleDayDisplay from './App/Components/SingleDayDisplay';
import jDate from './App/Code/JCal/jDate';
import Location from './App/Code/JCal/Location';
import Kavuah from './App/Code/Chashavshavon/Kavuah';
import EntryList from './App/Code/Chashavshavon/EntryList';

export default class LuachAndroid extends Component {
  constructor (props) {
    super(props)
    this.state = { locations: [], entryList: null, kavuahs: [] };
  }
  renderProgressEntry(entry) {
    return (<View style={styles.li}>
      <View>
        <Text style={styles.liText}>{entry}</Text>
      </View>
    </View>)
  }
  fillLocations() {
    Location.searchLocations('new').then(list =>
      this.setState({ locations: list.map(l => l.Name) }));
  }
  fillEntries() {
    EntryList.fromDatabase().then(list =>
      this.setState({ entryList: list }));
  }
  fillKavuahs() {
    if (!this.state.entryList) {
      throw 'EntryList must be retrived before Kavuah list';
    }
    Kavuah.getAll(this.state.entryList).then(list =>
      this.setState({ kavuahs: list }));
  }
  render() {
    const location = Location.getJerusalem(),
      ds = new ListView.DataSource({ rowHasChanged: (row1, row2) => { row1 !== row2; } });

    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarButton} onPress={this.fillLocations.bind(this)}>
            Fill Locations
                </Text>
          <Text style={styles.toolbarButton} onPress={this.fillEntries.bind(this)}>
            Fill Entries
                </Text>
          <Text style={styles.toolbarButton} onPress={this.fillKavuahs.bind(this)}>
            Fill Kavuahs
                </Text>
        </View>

        <Text style={styles.welcome}>
          Jewish Date Informtaion---
        </Text>
        <SingleDayDisplay jdate={new jDate()} location={location} />
        <Text>{'\n\n'}</Text>
        <ListView
          enableEmptySections={true}
          dataSource={ds.cloneWithRows(this.state.locations)}
          renderRow={this.renderProgressEntry}
          style={styles.liContainer} />
        <Text style={styles.instructions}>
          {'\n\n'}
          Double tap R on your keyboard to reload,{'\n'}
          Shake or press menu button for dev menu
        </Text>
      </View>);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  li: {
    borderBottomColor: '#c8c7cc',
    borderBottomWidth: 0.5,
    paddingTop: 15,
    paddingRight: 15,
    paddingBottom: 15,
  },
  liContainer: {
    backgroundColor: '#fff',
    flex: 1,
    paddingLeft: 15,
  },
  liIndent: {
    flex: 1,
  },
  liText: {
    color: '#333',
    fontSize: 17,
    fontWeight: '400',
    marginBottom: -3.5,
    marginTop: -3.5,
  },
  toolbar: {
    backgroundColor: '#51c04d',
    paddingTop: 30,
    paddingBottom: 10,
    flexDirection: 'row'
  },
  toolbarButton: {
    color: 'blue',
    textAlign: 'center',
    flex: 1
  },
});

AppRegistry.registerComponent('LuachAndroid', () => LuachAndroid);
