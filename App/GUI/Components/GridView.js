import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

export class GridView extends Component {
    styles = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: this.isRow() ? 'column' : 'row',
        },
    });

    isRow() {
        let isRow = false;
        React.Children.forEach(this.props.children, child => {
            if (child && child.type === Row) {
                isRow = true;
            }
        });

        return isRow;
    }

    render() {
        const { onPress, activeOpacity, containerStyle } = this.props;

        if (onPress) {
            return (
                <TouchableOpacity activeOpacity={activeOpacity} onPress={onPress}>
                    <View
                        style={[this.styles.container, containerStyle && containerStyle]}
                        {...this.props}>
                        {this.props.children}
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <View
                style={[this.styles.container, containerStyle && containerStyle]}
                {...this.props}
            >
                {this.props.children}
            </View>
        );
    }
}

export const Column = props => {
    const { containerStyle, size, onPress, activeOpacity } = props;

    const styles = StyleSheet.create({
        container: {
            flex: size ? size : containerStyle && containerStyle.width ? 0 : 1,
            flexDirection: 'column',
        },
    });

    if (onPress) {
        return (
            <TouchableOpacity
                style={[styles.container, containerStyle && containerStyle]}
                activeOpacity={activeOpacity}
                onPress={onPress}
            >
                <View {...props}>
                    {props.children}
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View
            style={[styles.container, containerStyle && containerStyle]}
            {...props}
        >
            {props.children}
        </View>
    );
};

export const Row = props => {
    const { containerStyle, size, onPress, activeOpacity } = props;

    const styles = StyleSheet.create({
        container: {
            flex: size ? size : containerStyle && containerStyle.height ? 0 : 1,
            flexDirection: 'row',
        },
    });

    if (onPress) {
        return (
            <TouchableOpacity
                style={[styles.container, containerStyle && containerStyle]}
                activeOpacity={activeOpacity}
                onPress={onPress}>
                <View {...props}>{props.children}</View>
            </TouchableOpacity>
        );
    }

    return (
        <View
            style={[styles.container, containerStyle && containerStyle]}
            {...props}>
            {props.children}
        </View>
    );
};

GridView.propTypes = {
    containerStyle: PropTypes.any,
    onPress: PropTypes.func,
    activeOpacity: PropTypes.number,
    children: PropTypes.any,
};

GridView.defaultProps = {
    activeOpacity: 1,
};

Row.propTypes = {
    size: PropTypes.number,
    containerStyle: PropTypes.any,
    onPress: PropTypes.func,
    activeOpacity: PropTypes.number,
    children: PropTypes.any,
};

Row.defaultProps = {
    activeOpacity: 1,
};

Column.propTypes = {
    size: PropTypes.number,
    containerStyle: PropTypes.any,
    onPress: PropTypes.func,
    activeOpacity: PropTypes.number,
    children: PropTypes.any,
};

Column.defaultProps = {
    activeOpacity: 1,
};
