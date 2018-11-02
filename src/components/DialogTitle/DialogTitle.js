

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';
import { Text } from '..';
import styles from './styles';

export default class DialogTitle extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      title, closeFunc, showMoreOptions, onMoreOptions,
    } = this.props;

    const renderMoreOptions = () => {
      if (!showMoreOptions) {
        return null;
      }

      return (
        <Icon
          containerStyle={styles.moreIconContainer}
          iconStyle={styles.moreIconFont}
          onPress={onMoreOptions}
          name="more-vert"
          hitSlop={{
            top: 20, left: 20, right: 20, bottom: 20,
          }}
        />
      );
    };

    return (
      <View style={styles.container}>
        { renderMoreOptions() }
        <Icon
          containerStyle={styles.closeIconContainer}
          iconStyle={styles.closeIconFont}
          name="close"
          onPress={closeFunc}
          hitSlop={{
            top: 20, bottom: 20, right: 20, left: 20,
          }}
        />
        <Text style={styles.title}>{title}</Text>
      </View>
    );
  }
}
