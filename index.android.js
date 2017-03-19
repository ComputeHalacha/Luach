/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';
import SingleDayDisplay from './App/Components/SingleDayDisplay';
import { Button } from 'react-native-elements'
import jDate from './App/Code/JCal/jDate';
import Location from './App/Code/JCal/Location';

export default class LuachAndroid extends Component {
  render() {
    const location = Location.getJerusalem();
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Jewish Date Informtaion
        </Text>
        <SingleDayDisplay jdate={jDate.toJDate()} location={location} />
        <Text style={styles.instructions}>
          {'\n\n'}
          This is a test...
          {'\n\n'}
          Double tap R on your keyboard to reload,{'\n'}
          Shake or press menu button for dev menu
        </Text>
        <Button
          raised
          icon={{ name: 'cached' }}
          title='RAISED WITH ICON' />
      </View>
    );
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
});

AppRegistry.registerComponent('LuachAndroid', () => LuachAndroid);
