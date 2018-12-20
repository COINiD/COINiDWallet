import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { Icon } from 'react-native-elements';
import styles from './styles';

class QRScan extends PureComponent {
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

  _onSuccess = (qrResults) => {
    const { navigation: { goBack, state: { params: { qrCodeResult } } } } = this.props;
    qrCodeResult(qrResults.data);
    goBack();
  };

  _onClose = () => {
    const { navigation: { goBack } } = this.props;
    goBack();
  };

  _onFlip = () => {
    const { cameraType } = this.state;

    this.setState({
      cameraType: cameraType === 'back' ? 'front' : 'back',
    });
  };

  _customMarker = () => (
    <View style={styles.markerContainer}>
      <View style={[styles.markerCorner, styles.markerTopLeft]} />
      <View style={[styles.markerCorner, styles.markerTopRight]} />
      <View style={[styles.markerCorner, styles.markerBottomLeft]} />
      <View style={[styles.markerCorner, styles.markerBottomRight]} />
    </View>
  );

  _renderNotAuthorized = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          textAlign: 'center',
          fontSize: 16,
          color: 'white',
        }}
      >
        Camera not authorized
      </Text>
    </View>
  );

  render() {
    const { cameraType } = this.state;

    return (
      <View style={styles.wrapper}>

        <QRCodeScanner
          cameraType={cameraType}
          onRead={this._onSuccess}
          topViewStyle={styles.topView}
          bottomViewStyle={styles.bottomView}
          topContent={(
            <Icon
              containerStyle={styles.closeIconContainer}
              name="close"
              onPress={this._onClose}
              size={24}
              reverse
            />
          )}
          showMarker
          customMarker={this._customMarker()}
          bottomContent={(
            <View style={styles.bottomView}>
              <Icon
                containerStyle={[styles.iconContainer, { transform: [{ rotate: '90deg' }] }]}
                name="autorenew"
                onPress={this._onFlip}
                size={32}
                color="white"
                underlayColor="transparent"
              />
            </View>
          )}
          fadeIn={false}
          cameraStyle={styles.container}
          notAuthorizedView={this._renderNotAuthorized()}
        />
      </View>
    );
  }
}

QRScan.propTypes = {};

export default QRScan;
