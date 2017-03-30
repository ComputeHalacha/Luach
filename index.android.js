import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, ListView } from 'react-native';
import './App/Code/initAndroid';
import SingleDayDisplay from './App/Components/SingleDayDisplay';
import jDate from './App/Code/JCal/jDate';
import Location from './App/Code/JCal/Location';
import Kavuah from './App/Code/Chashavshavon/Kavuah';
import EntryList from './App/Code/Chashavshavon/EntryList';
import Entry from './App/Code/Chashavshavon/Entry';
import Onah from './App/Code/Chashavshavon/Onah';
import AppData from './App/Code/Data/AppData';

export default class LuachAndroid extends Component {
  constructor (props) {
    super(props);
    /*const e1 = new Entry(new Onah(jDate.toJDate().addDays(-60), NightDay.Night), 28);
    e1.toDatabase().then(() => {
      const e2 = new Entry(new Onah(jDate.toJDate().addDays(-32), NightDay.Night), e1);
      e2.toDatabase().catch(error => console.error(error));
    }).catch(error => console.error(error));*/
    this.state = { listName: 'NO LIST LOADED', currLocation: {}, locations: [], entries: [], kavuahs: [], problems: [] };
    AppData.getAppData().then(ad => {
      this.setState({
        currLocation: ad.Settings.location,
        entries: ad.EntryList.list.map(e => e.toString()),
        kavuahs: ad.KavuahList.map(k => k.toString()),
        problems: ad.ProblemEntries.map(po => po.toString())
      });
      console.log('554 - AppData retreived from database:');
      console.log(ad);
    });
  }
  componentWillMount() {

  }
  renderListItem(item) {
    return (<View style={styles.li}>
      <View>
        <Text style={styles.liText}>{item}</Text>
      </View>
    </View>)
  }
  fillLocations() {
    Location.searchLocations('new').then(list =>
      this.setState({ locations: list.map(l => l.Name), listName: 'LOCATIONS' }));
  }
  fillEntries() {
    this.setState({ listName: 'ENTRIES' });
  }
  fillKavuahs() {
    this.setState({ listName: 'KAVUAHS' });
  }
  fillProblems() {
    this.setState({ listName: 'PROBLEMS' });
  }
  render() {
    const ds = new ListView.DataSource({ rowHasChanged: (row1, row2) => { row1 !== row2; } });
    let list = [];
    switch (this.state.listName) {
      case 'LOCATIONS':
        list = this.state.locations;
        break;
      case 'ENTRIES':
        list = this.state.entries;
        break;
      case 'KAVUAHS':
        list = this.state.kavuahs;
        break;
      case 'PROBLEMS':
        list = this.state.problems;
        break;
    }
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarButton} onPress={this.fillLocations.bind(this)}>
            Locations
                </Text>
          <Text style={styles.toolbarButton} onPress={this.fillEntries.bind(this)}>
            Entries
                </Text>
          <Text style={styles.toolbarButton} onPress={this.fillKavuahs.bind(this)}>
            Kavuahs
                </Text>
          <Text style={styles.toolbarButton} onPress={this.fillProblems.bind(this)}>
            Problems
                </Text>
        </View>

        <Text style={styles.welcome}>
          Jewish Date Informtaion---
        </Text>
        <SingleDayDisplay jdate={new jDate()} location={this.state.currLocation} />
        <Text>{this.state.listName}</Text>
        <ListView
          enableEmptySections={true}
          dataSource={ds.cloneWithRows(list)}
          renderRow={this.renderListItem}
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
    fontSize: 13,
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
