import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { getAddressTypeInfo } from 'coinid-address-types';
import { Text, Button, CheckBoxSelect } from '../components';
import { fontWeight } from '../config/styling';

import WalletContext from '../contexts/WalletContext';
import { t, withLocaleContext } from '../contexts/LocaleContext';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 0,
    maxHeight: 400,
  },
});

class SelectAddressType extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    dialogRef: PropTypes.shape({}).isRequired,
    onSelectAddressType: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
    };
  }

  _continue = () => {
    const { onSelectAddressType } = this.props;
    const { selectedIndex } = this.state;
    const { coinid } = this.context;

    const { supportedAddressTypes } = coinid.network;

    const addressType = supportedAddressTypes[selectedIndex];
    onSelectAddressType(addressType);
  };

  _onIndexChange = (selectedIndex) => {
    this.setState({ selectedIndex });
  };

  render() {
    const { selectedIndex } = this.state;

    const { coinid } = this.context;
    const { supportedAddressTypes } = coinid.network;
    const addressTypesInfo = supportedAddressTypes.map(addressType => ({
      title: t(`addresstypes.${addressType.toLowerCase()}.title`),
      description: t(`addresstypes.${addressType.toLowerCase()}.description`),
    }));
    const selectedAddressTypeInfo = addressTypesInfo[selectedIndex];

    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 16, ...fontWeight.normal }}>{t('selectaddresstype.text')}</Text>
        <View style={{ marginTop: 16 }}>
          <CheckBoxSelect
            onIndexChange={this._onIndexChange}
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
          {t('generic.continue')}
        </Button>
      </View>
    );
  }
}

export default withLocaleContext(SelectAddressType);
