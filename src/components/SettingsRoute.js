import React, { PureComponent } from 'react';
import {
  StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { Text } from '.';

import {
  colors, fontSize, fontWeight, fontStack,
} from '../config/styling';

const imageCOINiDLogo = require('../assets/images/coinid-logo.png');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: -16,
  },
  section: {
    marginTop: 16,
  },
  headline: {
    fontSize: fontSize.h2,
    color: colors.black,
    ...fontWeight.bold,
    paddingVertical: 8,
  },
  rightTitle: {
    color: colors.gray,
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    minHeight: '100%',
  },
  list: {
    marginTop: 0,
    marginBottom: 8,
    borderTopWidth: 0,
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
  listHint: {
    marginTop: -8,
    marginBottom: 8,
    fontSize: fontSize.small,
    color: colors.gray,
    ...fontWeight.normal,
  },
  listHeader: {
    marginTop: 0,
    marginBottom: 4,
    fontSize: fontSize.small,
    color: colors.black,
    ...fontWeight.normal,
  },
  logo: {
    marginTop: 16,
    marginBottom: isIphoneX() ? 23 : 11,
    width: 94.47,
    height: 33,
    alignSelf: 'center',
  },
  logoWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  highlightText: {
    color: colors.getTheme('light').highlight,
  },
  warningText: {
    color: colors.getTheme('light').warning,
  },
});

class SettingsRoute extends PureComponent {
  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('willFocus', this._onFocus);
  }

  componentWillUnmount() {
    this.focusListener.remove();
  }

  _onFocus = () => {
    const {
      navigation,
      navigation: {
        state: { routeName },
      },
      screenProps: { onRouteChange },
    } = this.props;

    onRouteChange({ routeName, navigation });
  };

  renderListItems = items => items.map((item, i) => (
    <ListItem
      containerStyle={styles.listItemContainer}
      wrapperStyle={styles.listItemWrapper}
      titleStyle={[
        styles.listItemTitle,
        item.isLink ? styles.highlightText : null,
        item.isWarning ? styles.warningText : null,
      ]}
      titleContainerStyle={styles.listItemTitleContainer}
      rightTitleStyle={[styles.listItemTitle, styles.rightTitle]}
      rightTitleContainerStyle={styles.listItemRightTitleContainer}
      disabledStyle={styles.listItemDisabled}
      chevronColor={colors.black}
      key={i}
      {...item}
    />
  ));

  renderSections = sections => sections.map((section, i) => (
    <View style={styles.section} key={i}>
      {section.headline && <Text style={styles.headline}>{section.headline}</Text>}
      <List containerStyle={styles.list}>{this.renderListItems(section.items)}</List>
      {section.listHint && <Text style={styles.listHint}>{section.listHint}</Text>}
    </View>
  ));

  render() {
    const {
      navigation: {
        state: { routeName },
      },
      screenProps: { settingsTree },
    } = this.props;

    return (
      <KeyboardAvoidingView
        enabled={Platform.OS === 'ios'}
        behavior="position"
        keyboardVerticalOffset={60}
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
      >
        <View style={styles.scrollWrapper}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {this.renderSections(settingsTree[routeName])}
            <View style={styles.logoWrapper}>
              <Image style={styles.logo} source={imageCOINiDLogo} resizeMode="contain" />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

export default SettingsRoute;
