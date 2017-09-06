import React, { PureComponent } from 'react';
import { View, WebView, BackHandler, Platform } from 'react-native';
import SideMenu from '../Components/SideMenu';
import { GeneralStyles } from '../styles';

export default class BrowserScreen extends PureComponent {
    static navigationOptions = ({ navigation }) => ({
        title: 'Documentation -  ' + navigation.state.params.title
    });
    constructor(props) {
        super(props);
        this.state = {};
        const { url, appData, onUpdate } = this.props.navigation.state.params;
        this.url = url;
        this.onUpdate = onUpdate;
        this.appData = appData;
        this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
        this.backHandler = this.backHandler.bind(this);
    }
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.backHandler);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
    }
    onNavigationStateChange(navState) {
        this.setState({ backButtonEnabled: navState && navState.canGoBack });
    }
    backHandler() {
        if (this.state.backButtonEnabled) {
            this.webView.goBack();
            return true;
        }
    }
    render() {
        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.onUpdate}
                        appData={this.appData}
                        navigator={this.props.navigation}
                        helpUrl='index.html'
                        helpTitle='Help Home' />
                    <WebView style={{ flex: 1 }}
                        ref={webView => this.webView = webView}
                        source={{
                            uri: (Platform.OS === 'android' ? 'file:///android_asset/' : '') +
                            'docs/' + this.url
                        }}
                        mixedContentMode='always'
                        iosdataDetectorTypes={['all']}
                        startInLoadingState={true}
                        onNavigationStateChange={this.onNavigationStateChange}
                    />
                </View>
            </View>
        );
    }
}