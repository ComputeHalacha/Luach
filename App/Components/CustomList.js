import React, { Component } from 'react';
import { ListView, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';

/*
PROPS ------------------------------------------
style=style of outer container
dataSource=[] data
rowHasChanged = function(row1, row2) to test if the row needs to be re-rendered
mainViewStyle =style of main containing view
titleStyle = style of main text
iconName = Name for left-side icon
iconStyle = style of main icon
iconType = type of main icon
iconColor = color of main icon
textSectionViewStyle = the style for the section that contains the title and buttons
buttonSection=buttons
------------------------------------------------
*/

export default class CustomList extends Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({
            rowHasChanged: props.rowHasChanged ?
                props.rowHasChanged : (r1, r2) => r1.toString() !== r2.toString()
        });
        this.dataSource = ds.cloneWithRows(props.dataSource);
    }
    render() {
        return <View style={[styles.outerStyle, this.props.style]}>
            <ListView
                dataSource={this.dataSource}
                renderRow={rowData => {
                    const mainViewStyle = typeof this.props.mainViewStyle === 'function' ?
                        this.props.mainViewStyle(rowData) : this.props.mainViewStyle,
                        titleStyle = typeof this.props.titleStyle === 'function' ?
                            this.props.titleStyle(rowData) : this.props.titleStyle,
                        iconStyle = typeof this.props.iconStyle === 'function' ?
                            this.props.iconStyle(rowData) : this.props.iconStyle,
                        iconName = typeof this.props.iconName === 'function' ?
                            this.props.iconName(rowData) : this.props.iconName,
                        iconType = typeof this.props.iconType === 'function' ?
                            this.props.iconType(rowData) : this.props.iconType,
                        iconColor = typeof this.props.iconColor === 'function' ?
                            this.props.iconColor(rowData) : this.props.iconColor,
                        textSectionViewStyle = typeof this.props.textSectionViewStyle === 'function' ?
                            this.props.textSectionViewStyle(rowData) : this.props.textSectionViewStyle,
                        buttonSection = typeof this.props.buttonSection === 'function' ?
                            this.props.buttonSection(rowData) : this.props.buttonSection;
                    return <View style={[styles.mainViewStyle, mainViewStyle]}>
                        {iconName &&
                            <Icon
                                name={iconName}
                                style={[styles.iconStyle, iconStyle]}
                                type={iconType}
                                color={iconColor} />
                        }
                        <View style={[styles.textSectionViewStyle, textSectionViewStyle]}>
                            <Text style={[styles.titleStyle, titleStyle]}>
                                {rowData.toString()}
                            </Text>
                            {buttonSection}
                        </View>
                    </View>;
                }} />
        </View>;
    }
}

const styles = StyleSheet.create({
    outerStyle: {
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: '#aab'

    },
    mainViewStyle: {
        borderBottomWidth: 1,
        borderBottomColor: '#bbc',
        flexDirection: 'row',
        paddingLeft: 15
    },
    iconStyle: {

    },
    titleStyle: {
        flexWrap: 'wrap'
    },
    textSectionViewStyle: {
        flexWrap: 'wrap',
        padding: 20
    }
});