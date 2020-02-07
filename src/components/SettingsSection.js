import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { List } from 'react-native-elements';
import TranslatedText from './TranslatedText';
import SettingsListItem from './SettingsListItem';

import { colors, fontSize, fontWeight } from '../config/styling';

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  headline: {
    fontSize: fontSize.h2,
    color: colors.black,
    ...fontWeight.bold,
    paddingVertical: 8,
  },
  listHint: {
    marginTop: 8,
    marginBottom: 0,
    fontSize: fontSize.small,
    color: colors.gray,
    ...fontWeight.normal,
  },
  list: {
    marginTop: 0,
    marginBottom: 0,
    borderTopWidth: 0,
  },
});

class SettingsSection extends PureComponent {
  static propTypes = {
    headline: PropTypes.string,
    listHint: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({})),
  };

  static defaultProps = {
    headline: '',
    listHint: '',
    items: [],
  };

  _renderListItems = items => items.map((item, i) => <SettingsListItem key={i} {...item} />);

  render() {
    const { headline, listHint, items } = this.props;

    return (
      <View style={styles.section}>
        {headline ? <TranslatedText style={styles.headline}>{headline}</TranslatedText> : null}
        <List containerStyle={styles.list}>{this._renderListItems(items)}</List>
        {listHint ? <TranslatedText style={styles.listHint}>{listHint}</TranslatedText> : null}
      </View>
    );
  }
}

export default SettingsSection;
