import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-elements';
import TranslatedText from './TranslatedText';
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
    const { confirmations, recommendedConfirmations: recommendedConfs } = this.props;

    const confirmed = confirmations !== undefined && confirmations >= recommendedConfs;
    const confirmedText = confirmed ? 'completed' : 'pending';
    const confirmedIcon = confirmed ? 'check-circle' : 'timer-sand';
    const confirmedTextStyle = confirmed ? null : styles.pending;
    const confirmedIconStyle = styles[confirmedText];

    return (
      <View style={styles.container}>
        <Icon
          iconStyle={[styles.icon, confirmedIconStyle]}
          name={confirmedIcon}
          type="material-community"
        />
        <TranslatedText style={[styles.text, confirmedTextStyle]}>
          {`transactionstate.${confirmedText}`}
        </TranslatedText>
      </View>
    );
  }
}
