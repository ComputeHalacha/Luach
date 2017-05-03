import React, { Component } from 'react';
import { ListView, StyleSheet, Text, View, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { NightDay } from '../Code/Chashavshavon/Onah';

/*
PROPS ------------------------------------------
style=style of outer container
dataSource=[] data
rowHasChanged = function(row1, row2) to test if the row needs to be re-rendered
mainViewStyle =style of main containing view
titleStyle = style of main text
title= function to extract main text from each item in the list
nightDay = if set, will display an icon and backgroud color for the correct value. Function needs to return a NightDay value.
iconName = Name for left-side icon
iconStyle = style of main icon
iconType = type of main icon
iconColor = color of main icon
iconSize = size of main icon
textSectionViewStyle = the style for the section that contains the title and buttons
buttonSection=buttons
emptyListText=The text to display if list is empty.
------------------------------------------------
*/

export default class CustomList extends Component {
    constructor(props) {
        super(props);
        this.listViewDataSource = new ListView.DataSource({
            rowHasChanged: props.rowHasChanged || ((r1, r2) => r1 !== r2)
        });
    }
    render() {
        return <View>
            {(this.props.dataSource && this.props.dataSource.length  &&
                <View style={[styles.outerStyle, this.props.style]}>
                    <ListView
                        dataSource={this.listViewDataSource.cloneWithRows(this.props.dataSource)}
                        renderRow={rowData => {
                            const mainViewStyle = typeof this.props.mainViewStyle === 'function' ?
                                this.props.mainViewStyle(rowData) : this.props.mainViewStyle,
                                title = typeof this.props.title === 'function' ?
                                    this.props.title(rowData) : rowData.toString(),
                                titleStyle = typeof this.props.titleStyle === 'function' ?
                                    this.props.titleStyle(rowData) : this.props.titleStyle,
                                nightDay = typeof this.props.nightDay === 'function' ?
                                    this.props.nightDay(rowData) : this.props.nightDay,
                                iconStyle = typeof this.props.iconStyle === 'function' ?
                                    this.props.iconStyle(rowData) : this.props.iconStyle,
                                iconName = typeof this.props.iconName === 'function' ?
                                    this.props.iconName(rowData) : this.props.iconName,
                                iconType = typeof this.props.iconType === 'function' ?
                                    this.props.iconType(rowData) : this.props.iconType,
                                iconColor = typeof this.props.iconColor === 'function' ?
                                    this.props.iconColor(rowData) : this.props.iconColor,
                                iconSize = typeof this.props.iconSize === 'function' ?
                                    this.props.iconSize(rowData) : this.props.iconSize,
                                textSectionViewStyle = typeof this.props.textSectionViewStyle === 'function' ?
                                    this.props.textSectionViewStyle(rowData) : this.props.textSectionViewStyle,
                                buttonSection = typeof this.props.buttonSection === 'function' ?
                                    this.props.buttonSection(rowData) : this.props.buttonSection;
                            return <View style={[
                                styles.mainViewStyle,
                                (nightDay && ({ backgroundColor: nightDay === NightDay.Night ? '#d0d0db' : '#fff' })),
                                mainViewStyle]}>
                                {(nightDay && (nightDay === NightDay.Night ?
                                    <Icon
                                        name='ios-moon'
                                        color='orange'
                                        type='ionicon'
                                        style={[styles.iconStyle, iconStyle]} />
                                    :
                                    <Icon
                                        name='ios-sunny'
                                        color='#fff100'
                                        type='ionicon'
                                        style={[styles.iconStyle, iconStyle]} />))
                                    ||
                                    (iconName &&
                                        <Icon
                                            name={iconName}
                                            style={[styles.iconStyle, iconStyle]}
                                            type={iconType}
                                            size={iconSize}
                                            color={iconColor} />)
                                }
                                <View style={[styles.textSectionViewStyle, textSectionViewStyle]}>
                                    <Text style={[styles.titleStyle, titleStyle]}>
                                        {title}
                                    </Text>
                                    {buttonSection}
                                </View>
                            </View>;
                        }} />
                </View>)
                ||
                <View style={styles.emptyListView}>
                    <Text style={styles.emptyListText}>{this.props.emptyListText}</Text>
                    <Image
                        source={require('../Images/logo.png')}
                        resizeMode='contain'
                        style={styles.emptyListImage} />
                </View>}
        </View>;
    }
}

const styles = StyleSheet.create({
    outerStyle: {
        borderTopWidth: 2,
        borderBottomWidth: 1,
        borderColor: '#cce'

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
    },
    emptyListView: {
        alignItems: 'center',
        flex: 1,
        marginTop: 50
    },
    emptyListText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#99b',
        marginBottom: 35,
        textAlign: 'center'
    },
    emptyListImage: {
        width: 150,
        height: 150
    }
});