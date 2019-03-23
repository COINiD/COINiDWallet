import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import bleCentral from 'react-native-p2p-transfer-ble-central';

import { Text, Button, CheckBoxSelect } from '../components';
import { colors, fontWeight } from '../config/styling';
import settings from '../config/settings';

import WalletContext from '../contexts/WalletContext';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 0,
    maxHeight: 400,
  },
  loader: {
    marginBottom: 40,
    marginTop: 30,
  },
  amountText: {
    marginBottom: 4,
    textAlign: 'center',
    ...fontWeight.normal,
  },
  fiatText: {
    color: colors.gray,
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    ...fontWeight.book,
  },
  outgoing: {
    color: colors.orange,
  },
  incoming: {
    color: colors.green,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  footerBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  footerLink: {
    fontSize: 16,
    marginRight: 5,
    textAlign: 'center',
  },

  row: {
    alignItems: 'stretch',
    flexDirection: 'row',
  },
  rowTitle: {
    color: colors.gray,
    marginTop: 8,
  },
  rowContainer: {
    flex: 1,
  },
  rowData: {
    flex: 1,
    textAlign: 'right',
  },
  rowText: {
    fontSize: 16,
  },
});

class SelectColdTransportType extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    onSelected: PropTypes.func.isRequired,
    dialogRef: PropTypes.shape({}).isRequired,
  };

  constructor(props) {
    super(props);

    const selectData = settings.coldTransportTypes.filter(e => e.key);

    this.state = {
      selectedIndex: 0,
      selectData,
      isBLESupported: false,
    };
  }

  componentDidMount() {
    bleCentral.isSupported().then((isBLESupported) => {
      this.setState({
        isBLESupported,
      });
    });
  }

  _close = (cb) => {
    const { dialogRef } = this.props;
    dialogRef._close(cb);
  };

  _continue = () => {
    const { selectedIndex, selectData } = this.state;
    const { key } = selectData[selectedIndex];
    const { onSelected } = this.props;

    this._close(() => {
      onSelected(key);
    });
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
      <View style={styles.container}>
        <Text style={{ fontSize: 16, ...fontWeight.normal }}>
          Select how you would like to connect to the offline device.
        </Text>
        <View style={{ marginTop: 16 }}>
          <CheckBoxSelect
            onIndexChange={(newIndex) => {
              this.setState({ selectedIndex: newIndex });
            }}
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
    );
  }
}

export default SelectColdTransportType;
