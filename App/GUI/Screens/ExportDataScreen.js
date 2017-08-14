import React from 'react';
import { ScrollView, View, Text, TextInput, Button, Picker } from 'react-native';
import { NavigationActions } from 'react-navigation';
import RNFS from 'react-native-fs';
import SideMenu from '../Components/SideMenu';
import { popUpMessage, log, warn, error, buttonColor } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

const exportPath = RNFS.DocumentDirectoryPath + '/exported';

export default class ExportData extends React.Component {
    static navigationOptions = {
        title: 'Export Data'
    };
    constructor(props) {
        super(props);
        this.navigator = this.props.navigation;
        this.appData = this.navigator.state.params.appData;
        this.state = {
            fileName: this.getFileName('Entries'),
            dataSet: 'Entries'
        };
        this.setDataSet = this.setDataSet.bind(this);
        this.doExport = this.doExport.bind(this);
    }
    getFileName(dataSet) {
        return `${dataSet} - ${(new Date()).toLocaleString().replace(/[\/,: ]/gi, '-')}`;
    }
    setDataSet(dataSet) {
        this.setState({
            fileName: this.getFileName(dataSet),
            dataSet: dataSet
        });
    }
    doExport() {
        if (!RNFS.exists(exportPath)) {
            RNFS.mkdir(exportPath).then(() => {
                this.doExport();
                return;
            });
        }
        if (__DEV__) {
            RNFS.readDir(exportPath)
                .then((result) => {
                    log('_ FILES IN ' + exportPath + ' ___________________________________________');
                    log(result);
                });
        }
        RNFS.writeFile(`${exportPath}/${(new Date()).toLocaleString().replace(/[\/,: ]/gi, '-')}`,
            'This is a test')
            .then(() => {
                popUpMessage(`The file ${this.state.fileName} has been successfully created.`,
                    'Export ' + this.state.dataSet);
                this.navigator.dispatch(NavigationActions.back());
            })
            .catch(err => {
                warn('Error trying to create ' + this.state.fileName);
                error(err);
            });
    }
    render() {
        return <View style={GeneralStyles.container}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <SideMenu
                    onUpdate={this.onUpdate}
                    appData={this.appData}
                    navigator={this.navigator}
                    helpUrl='Settings.html'
                    helpTitle='Settings' />
                <ScrollView style={{ flex: 1 }}>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Data to Export</Text>
                        <Picker style={GeneralStyles.picker}
                            selectedValue={this.state.dataSet}
                            onValueChange={value => this.setDataSet(value)}>
                            <Picker.Item label='Entries' value='Entries' />
                            <Picker.Item label='Events' value='Events' />
                            <Picker.Item label='Kavuahs' value='Kavuahs' />
                        </Picker>
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>File Name</Text>
                        <TextInput style={GeneralStyles.textInput}
                            autoFocus
                            placeholder='File Name'
                            onEndEditing={event =>
                                this.setState({ fileName: event.nativeEvent.text })}
                            defaultValue={this.state.fileName} />
                    </View>
                    <View style={GeneralStyles.btnAddNew}>
                        <Button
                            title='Export Data'
                            onPress={this.doExport}
                            accessibilityLabel='Export Data'
                            color={buttonColor} />
                    </View>
                </ScrollView>
            </View>
        </View>;
    }
}