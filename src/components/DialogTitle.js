import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-elements';

import TranslatedText from './TranslatedText';
import { colors, fontSize, fontWeight } from '../config/styling';

const styles = StyleSheet.create({
  container: {
    height: 56,
    justifyContent: 'center',
    zIndex: 100,
    position: 'relative',
    backgroundColor: colors.getTheme('light').seeThrough,
    width: '100%',
  },
  title: {
    fontSize: fontSize.h3,
    textAlign: 'center',
    ...fontWeight.bold,
    marginHorizontal: 46,
  },
  closeIconContainer: {
    position: 'absolute',
    zIndex: 10,
    right: 19,
    top: 19,
    margin: 0,
    padding: 0,
  },
  closeIconFont: {
    fontSize: 21,
  },
  moreIconContainer: {
    position: 'absolute',
    zIndex: 10,
    left: 19,
    top: 19,
    margin: 0,
    padding: 0,
  },
  moreIconFont: {
    fontSize: 21,
  },
});

export default class DialogTitle extends PureComponent {
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
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
          }}
          testID="button-actionsheet"
        />
      );
    };

    return (
      <View style={styles.container}>
        {renderMoreOptions()}
        <Icon
          containerStyle={styles.closeIconContainer}
          iconStyle={styles.closeIconFont}
          name="close"
          onPress={closeFunc}
          hitSlop={{
            top: 20,
            bottom: 20,
            right: 20,
            left: 20,
          }}
          testID="button-close"
        />
        <TranslatedText style={styles.title} testID="dialog-title">
          {title}
        </TranslatedText>
      </View>
    );
  }
}
