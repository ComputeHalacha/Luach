import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Button, processColor } from 'react-native';
import { GeneralStyles } from '../styles';
import { getScreenWidth } from '../../Code/GeneralUtils';

const darkColors = ['#b96', '#9b6', '#96b', '#f00', '#090', '#00f', '#707', '#770', '#077', '#000', '#853', '#777', '#eee'],
    lightColors = ['#fff', '#f88', '#8f8', '#88f', '#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#00f', '#ef9', '#9fe'],
    componentWidth = Math.trunc(getScreenWidth() * 0.9),
    tileWidth = Math.trunc(componentWidth / 3.0) - 3;

export default class ColorChooser extends React.Component {
    constructor(props) {
        super(props);
        this.state = { modalVisible: false };
        this.scheme = this.props.scheme || 'light';
        this.chooseColor = this.chooseColor.bind(this);
    }
    chooseColor(color) {
        this.props.onChange(color);
        this.setState({ modalVisible: false });
    }
    render() {
        const selectedColor = this.props.color,
            colorsArray = (this.props.colors && this.props.colors.length > 0) ?
                this.props.colors :
                (this.scheme === 'dark' ? darkColors : lightColors);
        return <View>
            <TouchableOpacity onPress={() => this.setState({ modalVisible: true })}>
                <View style={[GeneralStyles.textInput, { backgroundColor: selectedColor }]}>
                </View>
            </TouchableOpacity>
            <Modal
                style={{ flex: 1 }}
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => this.setState({ modalVisible: false })}>
                <View style={{
                    flex: 1,
                    backgroundColor: '#0009',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <View style={{
                        backgroundColor: '#fff',
                        flex: 0,
                        width: componentWidth
                    }}>
                        <View style={{
                            backgroundColor: '#88a',
                            paddingTop: 30,
                            paddingBottom: 30,
                            paddingLeft: 10,
                            paddingRight: 10
                        }}>
                            <Text style={{
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: 15,
                                textAlign: 'center'
                            }}>
                                {this.props.caption || 'Choose a Color'}
                            </Text>
                        </View>
                        <View style={styles.colorRow}>
                            {(colorsArray.indexOf(selectedColor) === -1) &&
                                <ColorCell
                                    color={selectedColor}
                                    selected={true}
                                    onChoose={this.chooseColor}
                                    scheme={this.scheme} />
                            }
                            {colorsArray.map((c, i) =>
                                <ColorCell
                                    key={i}
                                    color={c}
                                    selected={c === selectedColor}
                                    onChoose={this.chooseColor}
                                    scheme={this.scheme} />
                            )}
                        </View>
                        <View style={{
                            alignItems: 'center',
                            marginBottom: 10,
                            marginTop: 10
                        }}>
                            <Button onPress={() =>
                                this.setState({ modalVisible: false })} title='Close' />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>;
    }
}
function ColorCell(props) {
    const isLight = (Math.abs(processColor(props.color)) < 4482714);
    return <TouchableOpacity onPress={() =>
        props.onChoose(props.color)}>
        <View style={[styles.colorCell, { backgroundColor: props.color }]}>
            {props.selected &&
                <Text style={{
                    color: (isLight ? '#000' : '#fff'),
                    fontSize: 11,
                    fontStyle: 'italic'
                }}>
                    selected
                </Text>
            }
        </View>
    </TouchableOpacity>;
}
const styles = StyleSheet.create({
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#fff',
        padding: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    colorCell: {
        flex: -1,
        width: tileWidth,
        height: 50,
        margin: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    },
});