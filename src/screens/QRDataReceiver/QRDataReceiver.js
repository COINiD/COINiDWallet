import React, { PureComponent } from 'react';
import { Alert, View, Text } from 'react-native';
import QRDataTransferReceiver from 'react-native-qr-data-transfer-receiver';
import { Icon } from 'react-native-elements';
import styles from './styles';

class QRDataReceiver extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      cameraType: 'back',
    };
  }

  componentDidMount() {
    global.disableInactiveOverlay();
  }

  componentWillUnmount() {
    global.enableInactiveOverlay();
  }

  _dataReceived = (data) => {
    const { navigation: { state: { params: { onComplete } } } } = this.props;
    onComplete(data);
    this._goBack();
  };

  _receiveError = (error) => {
    console.log(error);
    this._goBack();
  }

  _goBack = () => {
    const { navigation: { goBack } } = this.props;
    goBack();
  };

  _flipCamera = () => {
    const { cameraType } = this.state;
    this.setState({
      cameraType: cameraType === 'back' ? 'front' : 'back',
    });
  };

  _renderCustomMarker = () => (
    <View style={[styles.markerContainer, styles.boxShadow]}>
      <View style={[styles.markerCorner, styles.markerTopLeft, styles.boxShadow]} />
      <View style={[styles.markerCorner, styles.markerTopRight, styles.boxShadow]} />
      <View style={[styles.markerCorner, styles.markerBottomLeft, styles.boxShadow]} />
      <View style={[styles.markerCorner, styles.markerBottomRight, styles.boxShadow]} />
    </View>
  );

  render() {
    const { cameraType } = this.state;

    const renderBox = ({ blockIndex, index, length, missingIndexes }) => {
      const blockStyle = [styles.block];

      if (blockIndex === 0) {
        blockStyle.push(styles.firstBlock);
      }

      if (missingIndexes.indexOf(blockIndex) === -1) {
        blockStyle.push(styles.activeCameraBlock);
      }

      if (blockIndex === index) {
        // animate cool effect
        console.log('WOW!');
      }

      if (length > 13) {
        blockStyle.push(styles.noBlockMargin);
      }

      return (<View key={`box-${blockIndex}`} style={blockStyle} />);
    };

    const renderCompletedItems = ({ index, length, missingIndexes, collectedSize }) => {
      if (length <= 1) {
        return null;
      }

      const boxes = Array(length)
        .fill()
        .map((e, blockIndex) => renderBox({
          blockIndex, index, length, missingIndexes,
        }));

      return (
        <View style={styles.completedItemsWrapper}>
          <Text style={[styles.completedItemsText, styles.textShadow]}>{`Scanned blocks (${collectedSize} of ${length})`}</Text>
          <View style={[styles.completedItemsShadow, styles.boxShadow]}>
            <View style={styles.completedItemsInner}>
              {boxes}
            </View>
          </View>
        </View>
      );
    };

    return (
      <QRDataTransferReceiver
        cameraType={cameraType}
        renderCompletedItems={renderCompletedItems}
        onComplete={this._dataReceived}
        onError={this._receiveError}
        customMarker={this._renderCustomMarker()}
        cameraStyle={styles.container}
        topViewStyle={styles.topView}
        bottomViewStyle={styles.bottomView}
        topContent={(
          <React.Fragment>
            <Icon
              containerStyle={styles.closeIconContainer}
              name="close"
              onPress={this._goBack}
              size={24}
              reverse
            />
            <Text style={[styles.title, styles.textShadow]}>{`Scan COINiD Vault QR Transfer`}</Text>
          </React.Fragment>
        )}
        bottomContent={(
          <Icon
            containerStyle={[styles.iconContainer, { transform: [{ rotate: '90deg' }] }]}
            name="autorenew"
            onPress={this._flipCamera}
            size={32}
            color="white"
            underlayColor="transparent"
          />
        )}
      />
    );
  }
}

QRDataReceiver.propTypes = {};

export default QRDataReceiver;
