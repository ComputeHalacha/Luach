import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AppRegistry, StyleSheet, Text, View, ListView, Image } from 'react-native';
import './App/Code/initAndroid';
import SingleDayDisplay from './App/Components/SingleDayDisplay';
import jDate from './App/Code/JCal/jDate';
import AppData from './App/Code/Data/AppData';
import DataUtils from './App/Code/Data/DataUtils';

export default class LuachAndroid extends Component {
  constructor (props) {
    super(props);
    /*const e1 = new Entry(new Onah(jDate.toJDate().addDays(-60), NightDay.Night), 28);
    e1.toDatabase().then(() => {
      const e2 = new Entry(new Onah(jDate.toJDate().addDays(-32), NightDay.Night), e1);
      e2.toDatabase().catch(error => console.error(error));
    }).catch(error => console.error(error));*/
    this.state = {
      appData: null,
      currDate: new jDate(),
      currLocation: null,
      listName: '',
      listItems: []
    };
    AppData.getAppData().then(ad => {
      this.setState({
        appData: ad,
        currLocation: ad.Settings.location
      });
      this.fillEntries();
      console.log('0554 - AppData retreived from database:');
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
    </View>);
  }
  fillLocations() {
    DataUtils.SearchLocations('new').then(list =>
      this.setState({ listItems: list.map(l => l.Name), listName: 'Settings' }));
  }
  fillEntries() {
    if (this.state.appData) {
      const li = this.state.appData.EntryList.descending.map(e => e.toString() + '.');
      this.setState({ listItems: li, listName: 'List of Entries' });
    }
  }
  fillKavuahs() {
    if (this.state.appData) {
      const li = this.state.appData.KavuahList.map(k => k.toString() + '.');
      this.setState({ listItems: li, listName: 'List of Kavuahs' });
    }
  }
  fillProblems() {
    if (this.state.appData) {
      const li = this.state.appData.ProblemOnahs.map(po => po.toString() + '.');
      this.setState({ listItems: li, listName: 'List of Dates' });
    }
  }
  render() {
    const ds = new ListView.DataSource({ rowHasChanged: (row1, row2) => { row1 !== row2; } }),
      currProbs = this.state.appData && this.state.appData.ProblemOnahs.filter(po =>
        po.jdate.Abs === this.state.currDate.Abs);
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.settingsButton} onPress={this.fillLocations.bind(this)}>
            Change Settings
          </Text>
        </View>
        <Text>{'\n'}</Text>
        <View style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
          <Image source={require('./App/Images/logo.png')} style={{ width: 40, height: 40, flex: 0, marginRight: 10 }} />
          <SingleDayDisplay jdate={this.state.currDate} location={this.state.currLocation} problems={currProbs} />
        </View>
        <View style={styles.listHeading}>
          <Text style={styles.listText}>{this.state.listName}</Text>
        </View>
        <ListView
          enableEmptySections={true}
          dataSource={ds.cloneWithRows(this.state.listItems)}
          renderRow={this.renderListItem}
          style={styles.liContainer} />
        <View style={styles.innerToolbar}>
          <Text style={styles.toolbarButton} onPress={this.fillEntries.bind(this)}>
            <Icon name="list" style={styles.toolButtonIcon} />
            {'\n'}
            Entries
          </Text>
          <Text style={styles.toolbarButton} onPress={this.fillKavuahs.bind(this)}>
            <Icon name="object-ungroup" style={styles.toolButtonIcon} />
            {'\n'}
            Kavuahs
          </Text>
          <Text style={styles.toolbarButton} onPress={this.fillProblems.bind(this)}>
            <Icon name="warning" style={styles.toolButtonIcon} />
            {'\n'}
            Dates
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            DO NOT depend halachikally upon this application
          </Text>
        </View>
      </View>);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  settingsButton: {
    fontSize: 13,
    color: '#AB8421',
    textAlign: 'center',
    flex: 1
  },
  listHeading: {
    flexDirection: 'row',
    marginBottom: 0,
    backgroundColor: '#f5f5e8',
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
    paddingBottom: 15,
  },
  liContainer: {
    backgroundColor: '#F5FCFF',
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
    backgroundColor: '#f5f5e8',
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row'
  },
  innerToolbar: {
    backgroundColor: '#f5f5e8',
    paddingTop: 10,
    paddingBottom: 4,
    flexDirection: 'row'
  },
  toolButtonIcon: {
    fontSize: 19
  },
  toolbarButton: {
    fontSize: 10,
    color: '#AB8421',
    textAlign: 'center',
    flex: 1
  },
  footer: {
    backgroundColor: '#FE9',
    padding: 5,
    flexDirection: 'row'
  },
  footerText: {
    fontSize:11,
    flex: 1,
    textAlign: 'center',
    color: '#666'
  }
});

AppRegistry.registerComponent('LuachAndroid', () => LuachAndroid);
