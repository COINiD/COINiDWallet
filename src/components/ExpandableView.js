import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Image, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { Text } from '.';
import {
  fontSize, fontWeight, colors, gridMultiplier,
} from '../config/styling';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  title: {
    fontSize: fontSize.base,
    ...fontWeight.medium,
    color: colors.gray,
    lineHeight: 24,
  },
  arrow: {
    height: 24,
    width: 24,
    marginLeft: gridMultiplier / 2,
  },
  titleWrapper: {
    flexDirection: 'row',
    marginBottom: gridMultiplier,
    justifyContent: 'center',
    alignSelf: 'center',
  },
});

export default class ExpandableView extends PureComponent {
  static propTypes = {
    children: PropTypes.func,
    initialIsExpanded: PropTypes.bool,
    expandedTitle: PropTypes.string,
    contractedTitle: PropTypes.string,
    getMaxHeight: PropTypes.func,
  };

  static defaultProps = {
    children: null,
    initialIsExpanded: false,
    expandedTitle: 'Contract',
    contractedTitle: 'Expand',
    getMaxHeight: () => 1000,
  };

  constructor(props) {
    super(props);

    const { initialIsExpanded, expandedTitle, contractedTitle } = props;

    this.state = {
      anim: new Animated.Value(initialIsExpanded ? 1 : 0),
      isExpanded: initialIsExpanded,
      title: initialIsExpanded ? expandedTitle : contractedTitle,
    };
  }

  _animate = (value) => {
    const { anim } = this.state;

    Animated.timing(anim, {
      duration: 320,
      toValue: value,
      useNativeDriver: false,
    }).start();
  };

  _toggle = () => {
    const { expandedTitle, contractedTitle } = this.props;
    const { isExpanded } = this.state;

    const title = isExpanded ? contractedTitle : expandedTitle;

    this.setState({ title, isExpanded: !isExpanded }, () => {
      this._animate(isExpanded ? 0 : 1);
    });
  };

  _getAnimStyle = () => {
    const { anim } = this.state;
    const { getMaxHeight } = this.props;

    return {
      maxHeight: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, getMaxHeight()],
      }),
    };
  };

  _getNonAnimStyle = () => {
    const { isExpanded } = this.state;
    const { getMaxHeight } = this.props;

    return {
      maxHeight: isExpanded ? getMaxHeight() : 0,
    };
  };

  render() {
    const { children, style } = this.props;

    const { title, isExpanded } = this.state;

    const animatedStyle = this._getAnimStyle();

    return (
      <React.Fragment>
        <TouchableOpacity onPress={this._toggle} style={styles.titleWrapper}>
          <Text style={styles.title}>{title}</Text>
          <Image
            source={require('../assets/images/expandable-arrow.png')}
            style={[styles.arrow, isExpanded ? { transform: [{ rotate: '180deg' }] } : {}]}
          />
        </TouchableOpacity>
        <Animated.View style={[styles.container, style, animatedStyle]}>{children}</Animated.View>
      </React.Fragment>
    );
  }
}
