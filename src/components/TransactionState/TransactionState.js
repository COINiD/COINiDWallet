'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';
import { Text } from '../../components';
import styles from './styles';

export default class TransactionState extends PureComponent {
  constructor(props) {
    super(props);

    const { confirmations, recommendedConfirmations } = props;

    this.state = {
      confirmations,
      recommendedConfirmations,
    };
  }
  
  componentWillReceiveProps(nextProps) {
    this.setState(nextProps);
  }

  render() {
    const { recommendedConfirmations } = this.state;

    const confirmed = (confirmations) => {
      return (confirmations !== undefined && confirmations >= recommendedConfirmations);
    }
    
    const confirmedText = (confirmations)  => {
      return confirmed(confirmations) ? 'completed' : 'pending';
    }
    
    const confirmedIcon = (confirmations)  => {
      return confirmed(confirmations) ? 'check-circle' : 'timer-sand';
    }
    
    const confirmedTextStyle = (confirmations) => {
      var text = confirmedText(confirmations);
      
      if (text === 'completed') {
        return {}
      }
      
      return styles['pending'];
    }
    
    const confirmedIconStyle = (confirmations) => {
      return styles[confirmedText(confirmations)];
    }
    
    const ucFirst = (string) => {
      return string[0].toUpperCase() + string.slice(1);
    }
    
    return (
      <View style={styles.container}>
        <Icon iconStyle={[styles.icon, confirmedIconStyle(this.state.confirmations)]} name={confirmedIcon(this.state.confirmations)} type='material-community' />
        <Text style={[styles.text, confirmedTextStyle(this.state.confirmations)]}>{ucFirst(confirmedText(this.state.confirmations))}</Text>
      </View>
    )
  }
};

