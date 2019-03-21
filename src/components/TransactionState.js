import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { Text } from '.';
import { colors, fontWeight } from '../config/styling';

const styles = StyleSheet.create({
  // Default modal style
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  icon: {
    fontSize: 16,
    marginRight: 4,
  },
  text: {
    fontSize: 16,
    ...fontWeight.medium,
  },
  pending: {
    color: colors.orange,
  },
  completed: {
    color: colors.green,
  },
});

export default class TransactionState extends PureComponent {
  static propTypes = {
    confirmations: PropTypes.number.isRequired,
    recommendedConfirmations: PropTypes.number.isRequired,
  };

  render() {
    const { confirmations: confs, recommendedConfirmations: recommendedConfs } = this.props;

    const confirmed = confirmations => confirmations !== undefined && confirmations >= recommendedConfs;

    const confirmedText = confirmations => (confirmed(confirmations) ? 'completed' : 'pending');

    const confirmedIcon = confirmations => (confirmed(confirmations) ? 'check-circle' : 'timer-sand');

    const confirmedTextStyle = (confirmations) => {
      const text = confirmedText(confirmations);

      if (text === 'completed') {
        return {};
      }

      return styles.pending;
    };

    const confirmedIconStyle = confirmations => styles[confirmedText(confirmations)];

    const ucFirst = string => string[0].toUpperCase() + string.slice(1);

    return (
      <View style={styles.container}>
        <Icon
          iconStyle={[styles.icon, confirmedIconStyle(confs)]}
          name={confirmedIcon(confs)}
          type="material-community"
        />
        <Text style={[styles.text, confirmedTextStyle(confs)]}>
          {ucFirst(confirmedText(confs))}
        </Text>
      </View>
    );
  }
}
