import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { NightDay } from '../Code/Chashavshavon/Onah';

/*
PROPS ------------------------------------------
    style = style of outer container
    data= = Array of data items
    rowHasChanged = function(row1, row2) to test if the row needs to be re-rendered. The default is row1===row2.
    emptyListText=The text to display if list is empty.

All the following props accept either a flat value or (dataItem, index) => prop value.
--------------------------------------------------------------------------------------------------
    mainViewStyle = style of main containing view
    titleStyle = style of main text
    title= function to extract main text from each item in the list
    nightDay = if set, will display an icon and backgroud color for the correct value. Function needs to return a NightDay value.
    iconName = Name for left-side icon
    iconStyle = style of main icon
    iconType = type of main icon
    iconColor = color of main icon
    iconSize = size of main icon
    textSectionViewStyle = the style for the section that contains the title and buttons
    secondSection=buttons

------------------------------------------------
*/

export default class CustomList extends Component {
    constructor(props) {
        super(props);
        this.renderItem = this.renderItem.bind(this);

        this.state = {
            data: (this.props.data && this.props.data.slice().map((o, i) => {
                if (!o.__index) {
                    o.__index = i;
                }
                return o;
            })) || []
        };
    }
    renderItem({ item }) {
        const index = item.__index,
            mainViewStyle = typeof this.props.mainViewStyle === 'function' ?
                this.props.mainViewStyle(item, index) : this.props.mainViewStyle,
            title = typeof this.props.title === 'function' ?
                this.props.title(item, index) : item.toString(),
            titleStyle = typeof this.props.titleStyle === 'function' ?
                this.props.titleStyle(item, index) : this.props.titleStyle,
            nightDay = typeof this.props.nightDay === 'function' ?
                this.props.nightDay(item, index) : this.props.nightDay,
            iconStyle = typeof this.props.iconStyle === 'function' ?
                this.props.iconStyle(item, index) : this.props.iconStyle,
            iconName = typeof this.props.iconName === 'function' ?
                this.props.iconName(item, index) : this.props.iconName,
            iconType = typeof this.props.iconType === 'function' ?
                this.props.iconType(item, index) : this.props.iconType,
            iconColor = typeof this.props.iconColor === 'function' ?
                this.props.iconColor(item, index) : this.props.iconColor,
            iconSize = typeof this.props.iconSize === 'function' ?
                this.props.iconSize(item, index) : this.props.iconSize,
            textSectionViewStyle = typeof this.props.textSectionViewStyle === 'function' ?
                this.props.textSectionViewStyle(item, index) : this.props.textSectionViewStyle,
            secondSection = typeof this.props.secondSection === 'function' ?
                this.props.secondSection(item, index) : this.props.secondSection;
        return (<View style={[
            styles.mainViewStyle,
            (nightDay && ({ backgroundColor: nightDay === NightDay.Night ? '#d0d0db' : '#fff' })),
            mainViewStyle]}>
            {(nightDay && (nightDay === NightDay.Night ?
                <Icon
                    name='ios-moon'
                    color='orange'
                    type='ionicon'
                    style={iconStyle}
                    containerStyle={styles.iconContainerStyle} />
                :
                <Icon
                    name='ios-sunny'
                    color='#fff100'
                    type='ionicon'
                    style={iconStyle}
                    containerStyle={styles.iconContainerStyle} />))
                ||
                (iconName &&
                    <Icon
                        name={iconName}
                        type={iconType}
                        size={iconSize}
                        color={iconColor}
                        style={iconStyle}
                        containerStyle={styles.iconContainerStyle} />)
            }
            <View style={[styles.textSectionViewStyle, textSectionViewStyle]}>
                <Text style={[styles.titleStyle, titleStyle]}>
                    {title}
                </Text>
                {secondSection}
            </View>
        </View>);
    }
    render() {
        return <View>
            {(this.state.data && this.state.data.length &&
                <View style={[styles.outerStyle, this.props.style]}>
                    <FlatList
                        data={this.state.data}
                        renderItem={this.renderItem}
                        keyExtractor={item => item.__index} />
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
        borderBottomColor: '#e8e8f0',
        flexDirection: 'row',
        paddingLeft: 15
    },
    iconContainerStyle: {
        paddingRight: 10
    },
    titleStyle: {
        flexWrap: 'wrap',
        paddingRight: 20
    },
    textSectionViewStyle: {
        flexWrap: 'wrap',
        paddingLeft: 0,
        paddingRight: 10,
        paddingTop: 10,
        paddingBottom: 5
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