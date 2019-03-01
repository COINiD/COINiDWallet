

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { getAddressTypeInfo } from 'coinid-address-types';
import {
  DetailsModal, Text, Button, CheckBoxSelect,
} from '../../components';
import { fontWeight } from '../../config/styling';
import styles from './styles';


export default class SelectAddressType extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
    };
  }

  getChildContext() {
    return {
      theme: this.props.theme ? this.props.theme : this.context.theme,
    };
  }

  _open = () => {
    this.detailsModal._open();
  };

  _close = () => {
    this.detailsModal._close();
  };

  _continue = () => {
    const { selectedIndex } = this.state;
    const { supportedAddressTypes } = this.context.coinid.network;

    const addressType = supportedAddressTypes[selectedIndex];
    this.props.onSelectAddressType(addressType);
  };

  render() {
    const { selectedIndex } = this.state;
    const { supportedAddressTypes } = this.context.coinid.network;
    const addressTypesInfo = supportedAddressTypes.map(e => getAddressTypeInfo(e));
    const selectedAddressTypeInfo = addressTypesInfo[selectedIndex];

    return (
      <DetailsModal
        ref={(c) => {
          this.detailsModal = c;
        }}
        title="Select address type"
      >
        <View style={styles.container}>
          <Text style={{ fontSize: 16, ...fontWeight.normal }}>
            What kind of addresses do you want the wallet to generate?
          </Text>
          <View style={{ marginTop: 16 }}>
            <CheckBoxSelect
              onIndexChange={selectedIndex => this.setState({ selectedIndex })}
              selectedIndex={selectedIndex}
              data={addressTypesInfo}
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
            {selectedAddressTypeInfo.description}
          </Text>
          <Button style={{ marginTop: 24 }} onPress={this._continue}>
            Continue
          </Button>
        </View>
      </DetailsModal>
    );
  }
}

SelectAddressType.contextTypes = {
  coinid: PropTypes.object,
  theme: PropTypes.string,
};

SelectAddressType.childContextTypes = {
  theme: PropTypes.string,
};

SelectAddressType.propTypes = {
  theme: PropTypes.string,
};

SelectAddressType.defaultProps = {
  theme: 'light',
};
