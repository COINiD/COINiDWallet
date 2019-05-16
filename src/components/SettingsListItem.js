import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import {
  colors, fontSize, fontWeight, fontStack,
} from '../config/styling';

const styles = StyleSheet.create({
  subtitle: {
    color: colors.gray,
    marginLeft: 2,
  },
  rightTitle: {
    color: colors.gray,
  },
  listItemContainer: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
    height: 56,
    justifyContent: 'center',
    borderBottomColor: colors.getBorder(),
    borderBottomWidth: 0.5,
  },
  listItemTitle: {
    marginLeft: 0,
    marginRight: 14,
    fontFamily: fontStack.primary,
    fontSize: fontSize.base,
    color: colors.black,
    ...fontWeight.medium,
  },
  listItemRightTitle: {
    color: colors.gray,
  },
  listItemWrapper: {
    marginLeft: 0,
  },
  listItemDisabled: {
    opacity: 0.5,
  },
  highlightText: {
    color: colors.getTheme('light').highlight,
  },
  warningText: {
    color: colors.getTheme('light').warning,
  },
});

class SettingsListItem extends PureComponent {
  static propTypes = {
    isLink: PropTypes.bool,
    isWarning: PropTypes.bool,
    customTitleStyle: PropTypes.shape({}),
    customRightTitleStyle: PropTypes.shape({}),
    customRightTitleContainerStyle: PropTypes.shape({}),
    customContainerStyle: PropTypes.shape({}),
  };

  static defaultProps = {
    isLink: false,
    isWarning: false,
    customTitleStyle: {},
    customRightTitleStyle: {},
    customContainerStyle: {},
  };

  render() {
    const {
      isLink,
      isWarning,
      customTitleStyle,
      customRightTitleStyle,
      customRightTitleContainerStyle,
      customContainerStyle,
    } = this.props;

    return (
      <ListItem
        containerStyle={[styles.listItemContainer, customContainerStyle]}
        wrapperStyle={styles.listItemWrapper}
        titleStyle={[
          styles.listItemTitle,
          isLink ? styles.highlightText : null,
          isWarning ? styles.warningText : null,
          customTitleStyle,
        ]}
        subtitleStyle={[styles.listItemTitle, styles.subtitle]}
        titleContainerStyle={styles.listItemTitleContainer}
        rightTitleStyle={[styles.listItemTitle, styles.rightTitle, customRightTitleStyle]}
        rightTitleContainerStyle={[
          styles.listItemRightTitleContainer,
          customRightTitleContainerStyle,
        ]}
        disabledStyle={styles.listItemDisabled}
        chevronColor={colors.black}
        {...this.props}
      />
    );
  }
}

export default SettingsListItem;
