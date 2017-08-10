import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Button } from 'react-native';
import { GeneralStyles } from '../styles';

let selectedColor, chooseColor;

export default class ColorChooser extends React.Component {
    constructor(props) {
        super(props);
        this.state = { modalVisible: false };

        chooseColor = this.chooseColor.bind(this);
    }
    chooseColor(color) {
        this.props.onChange(color);
        this.setState({ modalVisible: false });
    }
    render() {
        selectedColor = this.props.color;
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
                        width: 350,
                        maxWidth: '90%'
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
                            <ColorCell color={this.props.firstColor} />
                            <ColorCell color={'#9b6'} />
                            <ColorCell color={'#96b'} />
                        </View>
                        <View style={styles.colorRow}>
                            <ColorCell color={'#f00'} />
                            <ColorCell color={'#090'} />
                            <ColorCell color={'#00f'} />
                        </View>
                        <View style={styles.colorRow}>
                            <ColorCell color={'#707'} />
                            <ColorCell color={'#770'} />
                            <ColorCell color={'#077'} />
                        </View>
                        <View style={styles.colorRow}>
                            <ColorCell color={'#000'} />
                            <ColorCell color={'#853'} />
                            <ColorCell color={'#777'} />
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
    const isSelected = selectedColor === props.color;
    return <TouchableOpacity style={{ flex: 1 }} onPress={() =>
        chooseColor(props.color)}>
        <View style={[styles.colorCell, { backgroundColor: props.color }]}>
            {isSelected &&
                <Text style={{
                    color: '#fff',
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
        height: 50,
        flexDirection: 'row'
    },
    colorCell: {
        flex: 1,
        borderColor: '#fff',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    },
});