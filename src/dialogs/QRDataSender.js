import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import QRDataTransferSender from 'react-native-qr-data-transfer-sender';

import { Text, Button } from '../components';
import { fontWeight } from '../config/styling';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 0,
  },
  blockContainer: {
    marginLeft: -3,
    flexDirection: 'row',
  },
  block: {
    backgroundColor: '#DADADA',
    height: 6,
    flex: 1,
    marginLeft: 3,
    marginTop: 19,
  },
  activeBlock: {
    backgroundColor: '#617AF7',
  },
  noBlockMargin: {
    marginLeft: 0,
  },
});

export default class QRDataSender extends PureComponent {
  static propTypes = {
    data: PropTypes.string.isRequired,
    onDone: PropTypes.func.isRequired,
    dialogRef: PropTypes.shape({}).isRequired,
    dialogWidth: PropTypes.number.isRequired,
    dialogHeight: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.state = {};
  }

  _done = () => {
    const { onDone } = this.props;
    onDone();
  };

  _onLayoutTop = ({ nativeEvent }) => {
    const { layout } = nativeEvent;
    const { height: topHeight } = layout;

    this.setState({
      topHeight,
    });
  };

  _onLayoutBottom = ({ nativeEvent }) => {
    const { layout } = nativeEvent;
    const { height: bottomHeight } = layout;

    this.setState({
      bottomHeight,
    });
  };

  _calcQrWidth = () => {
    const { topHeight, bottomHeight } = this.state;
    const { dialogWidth, dialogHeight } = this.props;

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
    const { data } = this.props;
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
    );
  }
}
