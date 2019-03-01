import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Dimensions } from 'react-native';
import QRDataTransferSender from 'react-native-qr-data-transfer-sender';

import { DetailsModal, Text, Button } from '../../components';
import { fontWeight } from '../../config/styling';
import styles from './styles';

export default class QRDataSender extends PureComponent {
  constructor(props) {
    super(props);

    const { height } = Dimensions.get('window');

    this.state = {
      data: '',
    };
  }

  getChildContext() {
    return {
      theme: this.props.theme ? this.props.theme : this.context.theme,
    };
  }

  _open = (data, doneCb) => {
    this.doneCb = doneCb;
    this.setState({ data });
    this.detailsModal._open();
  };

  _close = () => {
    this.detailsModal._close();
  };

  _done = () => {
    this.doneCb();
    this._close();
  };

  _onLayout = ({
    nativeEvent: {
      layout: { width, height },
    },
  }) => {
    this.setState({
      dialogHeight: height,
      dialogWidth: width,
    });
  };

  _onLayoutTop = ({
    nativeEvent: {
      layout: { height },
    },
  }) => {
    this.setState({
      topHeight: height,
    });
  };

  _onLayoutBottom = ({
    nativeEvent: {
      layout: { height },
    },
  }) => {
    this.setState({
      bottomHeight: height,
    });
  };

  _calcQrWidth = () => {
    const {
      dialogWidth, dialogHeight, topHeight, bottomHeight,
    } = this.state;

    if (
      dialogWidth === undefined
      || dialogHeight === undefined
      || topHeight === undefined
      || bottomHeight === undefined
    ) {
      if (dialogWidth) {
        return dialogWidth - 56 - 16;
      }
      return 0;
    }

    const availableHeight = dialogHeight - topHeight - bottomHeight - 24 - 24 - 56;
    const availableWidth = dialogWidth - 56 - 16;

    let qrWidth = availableWidth;
    if (availableHeight < qrWidth) {
      qrWidth = availableHeight;
    }

    if (qrWidth < 160) {
      return 160;
    }

    return qrWidth;
  };

  render() {
    const { data } = this.state;
    const qrWidth = this._calcQrWidth();

    const renderBox = ({ blockIndex, index, length }) => {
      const blockStyle = [styles.block];

      if (blockIndex === index) {
        blockStyle.push(styles.activeBlock);
      }

      if (length > 13) {
        blockStyle.push(styles.noBlockMargin);
      }

      return <View key={`box-${blockIndex}`} style={blockStyle} />;
    };

    const renderQr = () => {
      if (qrWidth === 0) {
        return null;
      }

      return (
        <QRDataTransferSender
          data={data}
          itemContainerStyle={styles.blockContainer}
          renderCurrentItem={({ index, length }) => {
            if (length === 1) {
              return null;
            }

            const boxes = Array(length)
              .fill()
              .map((e, blockIndex) => renderBox({ blockIndex, index, length }));
            return boxes;
          }}
          ecl="L"
          qrWidth={qrWidth}
        />
      );
    };

    return (
      <DetailsModal
        onOuterLayout={this._onLayout}
        ref={(c) => {
          this.detailsModal = c;
        }}
        title="QR Transfer to Vault"
      >
        <View style={styles.container}>
          <View onLayout={this._onLayoutTop}>
            <Text style={{ fontSize: 16, ...fontWeight.normal }}>
              Scan the QR Code from the offline device.
            </Text>
          </View>
          <View style={{ marginTop: 16, alignItems: 'center' }}>{renderQr()}</View>
          <View onLayout={this._onLayoutBottom}>
            <Button style={{ marginTop: 24 }} onPress={this._done}>
              Done
            </Button>
          </View>
        </View>
      </DetailsModal>
    );
  }
}

QRDataSender.contextTypes = {
  theme: PropTypes.string,
};

QRDataSender.childContextTypes = {
  theme: PropTypes.string,
};

QRDataSender.propTypes = {
  theme: PropTypes.string,
};

QRDataSender.defaultProps = {
  theme: 'light',
};
