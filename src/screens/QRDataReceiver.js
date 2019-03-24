import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import QRDataTransferReceiver from 'react-native-qr-data-transfer-receiver';
import { Icon } from 'react-native-elements';
import { colors, fontWeight, fontSize } from '../config/styling';
import { ifSmallDevice } from '../utils/device';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
    position: 'relative',
  },
  firstBlock: {
    marginLeft: 0,
  },
  block: {
    backgroundColor: '#DADADA',
    height: 6,
    flex: 1,
    marginLeft: 3,
  },
  activeBlock: {
    backgroundColor: '#617AF7',
  },
  activeCameraBlock: {
    backgroundColor: '#00D6B0',
  },
  blockContainer: {
    marginLeft: -3,
    flexDirection: 'row',
  },
  noBlockMargin: {
    marginLeft: 0,
  },
  completedItemsWrapper: {
    position: 'absolute',
    width: '100%',
    padding: 24,
    top: -68,
  },
  boxShadow: {
    shadowRadius: 12,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowColor: 'rgba(0,0,0,0.35)',
  },
  completedItemsShadow: {
    width: '100%',
  },
  completedItemsInner: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  completedItemsText: {
    color: colors.white,
    ...fontWeight.bold,
    fontSize: fontSize.h3,
    textAlign: 'center',
    marginBottom: 16,
    textShadowRadius: 12,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
  },
  title: {
    color: colors.white,
    ...fontWeight.bold,
    fontSize: fontSize.h3,
    textAlign: 'center',
    position: 'absolute',
    top: 100,
  },
  textShadow: {
    textShadowRadius: 12,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
  },
  topView: {
    position: 'absolute',
    zIndex: 1000,
    margin: 0,
    padding: 0,
    height: 200,
  },

  bottomView: {
    backgroundColor: 'transparent',
    bottom: 0,
    flex: 0,
    height: 100,
    padding: 0,
    position: 'absolute',
    flexDirection: 'row',
  },

  iconContainer: {
    padding: 20,
    marginLeft: 8,
    marginRight: 8,
  },

  closeIconContainer: {
    position: 'absolute',
    right: 16,
    top: 28,
    backgroundColor: colors.darkGray,
    borderRadius: 8,
    width: 48,
    height: 48,
    margin: 0,
  },

  markerContainer: {
    position: 'relative',
    overflow: 'visible',
    ...ifSmallDevice(
      {
        width: 177,
        height: 177,
      },
      {
        width: 264,
        height: 264,
      },
    ),
  },

  markerCorner: {
    position: 'absolute',
    borderColor: colors.white,
    borderWidth: 3,
    width: 12.5,
    height: 12.5,
    overflow: 'visible',
  },

  markerTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },

  markerTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },

  markerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },

  markerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
});

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
    const {
      navigation: {
        state: {
          params: { onComplete },
        },
      },
    } = this.props;
    onComplete(data);
    this._goBack();
  };

  _receiveError = () => {
    this._goBack();
  };

  _goBack = () => {
    const {
      navigation: { goBack },
    } = this.props;
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

    const renderBox = ({
      blockIndex, index, length, missingIndexes,
    }) => {
      const blockStyle = [styles.block];

      if (blockIndex === 0) {
        blockStyle.push(styles.firstBlock);
      }

      if (missingIndexes.indexOf(blockIndex) === -1) {
        blockStyle.push(styles.activeCameraBlock);
      }

      if (blockIndex === index) {
        // animate cool effect
      }

      if (length > 13) {
        blockStyle.push(styles.noBlockMargin);
      }

      return <View key={`box-${blockIndex}`} style={blockStyle} />;
    };

    const renderCompletedItems = ({
      index, length, missingIndexes, collectedSize,
    }) => {
      if (length <= 1) {
        return null;
      }

      const boxes = Array(length)
        .fill()
        .map((e, blockIndex) => renderBox({
          blockIndex,
          index,
          length,
          missingIndexes,
        }));

      return (
        <View style={styles.completedItemsWrapper}>
          <Text style={[styles.completedItemsText, styles.textShadow]}>
            {`Scanned blocks (${collectedSize} of ${length})`}
          </Text>
          <View style={[styles.completedItemsShadow, styles.boxShadow]}>
            <View style={styles.completedItemsInner}>{boxes}</View>
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
            <Text style={[styles.title, styles.textShadow]}>Scan COINiD Vault QR Transfer</Text>
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

QRDataReceiver.propTypes = {
  navigation: PropTypes.shape({}).isRequired,
};

export default QRDataReceiver;
