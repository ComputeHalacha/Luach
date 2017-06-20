import React, { Component } from 'react';
import { WebView } from 'react-native';

export default class BrowserScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: 'Luach Help -  ' + navigation.state.params.title
    });
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <WebView
                source={{ uri: 'file:///android_asset/docs/' + this.props.navigation.state.params.url }}
                mixedContentMode='always'
                iosdataDetectorTypes={['all']}
                startInLoadingState={true}
            />
        );
    }
}