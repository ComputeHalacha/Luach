import React from 'react';
import { View, Text, TouchableOpacity, Modal, Button, Picker, StyleSheet } from 'react-native';
import { range } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export const CoordinatesType = Object.freeze({
    Longitude: 0,
    Latitude: 1
}),
    DirectionLat = Object.freeze({
        North: 1,
        South: -1
    }),
    DirectionLon = Object.freeze({
        West: 1,
        East: -1
    });

export class CoordinatesChooser extends React.PureComponent {
    constructor(props) {
        super(props);
        this.coordinatesType = this.props.coordinatesType;
        this.degreesRange = this.coordinatesType === CoordinatesType.Latitude
            ? range(0, 180)
            : range(0, 90);
        this.minsSecsRange = range(0, 60);
        this.state = {
            modalVisible: false,
            ...this.degToCoords(this.props.value)
        };
    }
    degToCoords(degreeDecimal) {
        const deg = Math.abs(degreeDecimal);
        let degrees = Math.floor(deg),
            minutes = Math.floor((deg * 3600) / 60) % 60,
            seconds = Math.round(deg * 3600 % 60);
        if (seconds === 60) {
            seconds = 0;
        }
        if (minutes === 60) {
            minutes = 0;
            degrees++;
        }
        const direction = degreeDecimal >= 0
            ? (this.coordinatesType === CoordinatesType.Latitude
                ? DirectionLat.North
                : DirectionLon.West)
            : (this.coordinatesType === CoordinatesType.Latitude
                ? DirectionLat.South
                : DirectionLon.East);
        return { degrees, minutes, seconds, direction };
    }
    getCoordsDeg() {
        const { degrees, minutes, seconds } = this.state,
            sixtieth = 0.016666666666666666;
        return this.state.direction *
            (degrees + (minutes * sixtieth) + (seconds * (sixtieth ** 2)));
    }
    getCoordsString() {
        return this.state.degrees.toString() + '° ' +
            this.state.minutes.toString() + '\' ' +
            this.state.seconds.toString() + '"  ' +
            this.getDirectionText();
    }
    getDirectionText() {
        return this.coordinatesType === CoordinatesType.Latitude
            ? (this.state.direction === DirectionLat.North
                ? 'North'
                : 'South')
            : (this.state.direction === DirectionLon.West
                ? 'West'
                : 'East');
    }
    close() {
        this.props.setCoordinates(this.getCoordsDeg());
        this.setState({ modalVisible: false });
    }

    render() {
        return <View>
            <TouchableOpacity onPress={() => this.setState({ modalVisible: true })}>
                <View style={GeneralStyles.textInput}>
                    <Text>{this.getCoordsString()}</Text>
                </View>
            </TouchableOpacity>
            <Modal
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => this.close()}>
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
                                fontSize: 18,
                                textAlign: 'center'
                            }}>
                                {`Select ${this.coordinatesType === CoordinatesType.Latitude
                                    ? 'Latitude'
                                    : 'Longitude'}`}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                            <View style={{ width: '24%' }}>
                                <Text style={localStyles.label}>Degrees</Text>
                                <Picker style={localStyles.picker}
                                    textStyle={{ fontSize: 10 }}
                                    selectedValue={this.state.degrees}
                                    onValueChange={degrees => this.setState({ degrees })}>
                                    {this.degreesRange.map(d =>
                                        <Picker.Item label={d.toString()} value={d} key={d} />
                                    )}
                                </Picker>
                            </View>
                            <View style={{ width: '24%' }}>
                                <Text style={localStyles.label}>Minutes</Text>
                                <Picker style={localStyles.picker}
                                    textStyle={{ fontSize: 10 }}
                                    selectedValue={this.state.minutes}
                                    onValueChange={minutes => this.setState({ minutes })}>
                                    {this.minsSecsRange.map(d =>
                                        <Picker.Item label={d.toString()} value={d} key={d} />
                                    )}
                                </Picker>
                            </View>
                            <View style={{ width: '24%' }}>
                                <Text style={localStyles.label}>Seconds</Text>
                                <Picker style={localStyles.picker}
                                    textStyle={{ fontSize: 10 }}
                                    selectedValue={this.state.seconds}
                                    onValueChange={seconds => this.setState({ seconds })}>
                                    {this.minsSecsRange.map(d =>
                                        <Picker.Item label={d.toString()} value={d} key={d} />
                                    )}
                                </Picker>
                            </View>
                            <View style={{ width: '28%' }}>
                                <Text style={localStyles.label}>Direction</Text>
                                <Picker style={localStyles.picker}
                                    textStyle={{ fontSize: 10 }}
                                    selectedValue={this.state.direction}
                                    onValueChange={direction => this.setState({ direction })}>
                                    <Picker.Item
                                        label={this.coordinatesType === CoordinatesType.Latitude
                                            ? 'North'
                                            : 'West'}
                                        value={this.coordinatesType === CoordinatesType.Latitude
                                            ? DirectionLat.North
                                            : DirectionLon.West} />
                                    <Picker.Item
                                        label={this.coordinatesType === CoordinatesType.Latitude
                                            ? 'South'
                                            : 'East'}
                                        value={this.coordinatesType === CoordinatesType.Latitude
                                            ? DirectionLat.South
                                            : DirectionLon.East} />
                                </Picker>
                            </View>
                        </View>
                        <View style={{
                            alignItems: 'center',
                            marginBottom: 10
                        }}>
                            <Button onPress={() => this.close()} title='Close' />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>;
    }
}
const localStyles = StyleSheet.create({
    label: {
        margin: 0,
        backgroundColor: '#d5d5e6',
        padding: 5,
        fontSize: 10
    },
    picker: { margin: 0 }
});