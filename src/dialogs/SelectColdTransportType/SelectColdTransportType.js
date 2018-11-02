

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import bleCentral from 'react-native-p2p-transfer-ble-central';

import {
  DetailsModal, Text, Button, CheckBoxSelect,
} from '../../components';
import { fontWeight } from '../../config/styling';
import settings from '../../config/settings';
import styles from './styles';

export default class SelectColdTransportType extends PureComponent {
  constructor(props) {
    super(props);

    const selectData = settings.coldTransportTypes.filter(e => e.key);

    this.state = {
      selectedIndex: 0,
      selectData,
      isBLESupported: false,
    };
  }

  getChildContext() {
    return {
      theme: this.props.theme ? this.props.theme : this.context.theme,
    };
  }

  componentDidMount() {
    bleCentral.isSupported()
      .then((isBLESupported) => {
        this.setState({
          isBLESupported,
        });
      });
  }

  _open = (onSelectCb) => {
    this.detailsModal._open();
    this.onSelectCb = onSelectCb;
  };

  _close = () => {
    this.detailsModal._close();
  };

  _continue = () => {
    const { selectedIndex, selectData } = this.state;
    const { key } = selectData[selectedIndex];
    const { onSelectColdTransportType } = this.props;

    onSelectColdTransportType(key);
    this.onSelectCb(key);

    this._close();
  };

  render() {
    const { selectedIndex, selectData } = this.state;
    const selectedOption = selectData[selectedIndex];

    const getButtonInfo = () => {
      const { isBLESupported } = this.state;

      if (selectedOption.key === 'ble' && !isBLESupported) {
        return {
          buttonText: 'Device not supported',
          disableButton: true,
        };
      }

      return {
        buttonText: 'Continue',
        disableButton: false,
      };
    };

    const { disableButton, buttonText } = getButtonInfo();

    return (
      <DetailsModal
        ref={(c) => {
          this.detailsModal = c;
        }}
        title="Choose how to connect"
      >
        <View style={styles.container}>
          <Text style={{ fontSize: 16, ...fontWeight.normal }}>
            Select how you would like to connect to the offline device.
          </Text>
          <View style={{ marginTop: 16 }}>
            <CheckBoxSelect
              onIndexChange={(newIndex) => { this.setState({ selectedIndex: newIndex }); }}
              selectedIndex={selectedIndex}
              data={selectData}
            />
          </View>
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: '#8A8A8F',
              ...fontWeight.normal,
            }}
          >
            {selectedOption.description}
          </Text>
          <Button style={{ marginTop: 24 }} onPress={this._continue} disabled={disableButton}>
            {buttonText}
          </Button>
        </View>
      </DetailsModal>
    );
  }
}

SelectColdTransportType.contextTypes = {
  theme: PropTypes.string,
};

SelectColdTransportType.childContextTypes = {
  theme: PropTypes.string,
};

SelectColdTransportType.propTypes = {
  theme: PropTypes.string,
  onSelectColdTransportType: PropTypes.func,
};

SelectColdTransportType.defaultProps = {
  theme: 'light',
  onSelectColdTransportType: () => {},
};
