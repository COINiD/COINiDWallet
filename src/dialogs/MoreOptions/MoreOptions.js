

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, TouchableHighlight } from 'react-native';
import { Text, Modal } from '../../components';
import styles from './styles';

export default class MoreOptions extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps() {

  }

  getChildContext() {
    return {
      theme: this.props.theme ? this.props.theme : this.context.theme,
    };
  }

  _getOptions = () => this.state.options

  _setOptions = (options) => {
    this.setState({ options });
    this.forceUpdate();
  }

  _open = (options) => {
    this._setOptions(options);
    this.elModal._open();
  }

  _close = () => {
    this.elModal._close();
  }

  _onOpened = () => {

  }

  _onClosed = () => {

  }

  _renderOptionGroupItems = og => og.map((o, i) => (
    [
      (i ? <View key={`${i}sep`} style={styles.seperator} /> : null),
      <TouchableOpacity
        key={i}
        activeOpacity={0.9}
        style={[styles.button, (og.length === 1 ? styles.singleButton : null)]}
        onPress={o.onPress}
      >
        <Text style={styles.buttonText}>{o.title}</Text>
      </TouchableOpacity>,
    ]
  ))

  _renderOptions = () => {
    const { options } = this.state;

    if (options === undefined) {
      return null;
    }

    return options.map((og, gi) => (
      <View key={gi} style={styles.buttonGroup}>
        { this._renderOptionGroupItems(og) }
      </View>
    ));
  }

  render() {
    return (
      <Modal
        ref={(c) => { this.elModal = c; }}
        verticalPosition="flex-end"
        onOpened={this._onOpened}
        onClosed={this._onClosed}
      >
        <View style={styles.container}>
          {this._renderOptions()}
        </View>
      </Modal>
    );
  }
}

MoreOptions.contextTypes = {
  coinid: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
};

MoreOptions.childContextTypes = {
  theme: PropTypes.string,
};

MoreOptions.propTypes = {
  theme: PropTypes.string,
};

MoreOptions.defaultProps = {
  theme: 'light',
};
