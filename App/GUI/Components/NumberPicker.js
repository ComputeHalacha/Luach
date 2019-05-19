import React from 'react';
import { View, Text } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import { setDefault, range } from '../../Code/GeneralUtils';
import Utils from '../../Code/JCal/Utils';
import { GeneralStyles } from '../styles';

export default class NumberPicker extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            text: getValueText(props.value, props.unitName, props.suffixed),
        };
    }
    render() {
        const {
            style,
            startNumber,
            endNumber,
            suffixed,
            unitName,
            onChange,
        } = this.props;
        return (
            <ModalSelector
                onChange={o => {
                    onChange(o.key);
                    this.setState({
                        text: getValueText(o.key, unitName, suffixed),
                    });
                }}
                data={getOptions(
                    setDefault(startNumber, 1),
                    endNumber,
                    unitName,
                    suffixed
                )}>
                <View style={style || GeneralStyles.timeInput}>
                    <Text>{this.state.text}</Text>
                </View>
            </ModalSelector>
        );
    }
}

function getValueText(value, unitName, suffixed) {
    return (
        (suffixed ? Utils.toSuffixed(value) : value.toString()) +
        (unitName ? ' ' + unitName + (value !== 1 && !suffixed ? 's' : '') : '')
    );
}
function getOptions(startNumber, endNumber, unitName, suffixed) {
    return range(startNumber, endNumber).map(n => ({
        label: getValueText(n, unitName, suffixed),
        key: n,
    }));
}
