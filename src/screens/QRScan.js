import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { Icon } from 'react-native-elements';
import { colors } from '../config/styling';
import { t, withLocaleContext } from '../contexts/LocaleContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
    position: 'relative',
  },
  wrapper: {
    flex: 1,
    backgroundColor: colors.black,
  },
  topView: {
    position: 'absolute',
    zIndex: 1000,
    margin: 0,
    padding: 0,
    height: 100,
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
    width: 264,
    height: 264,
  },

  markerCorner: {
    position: 'absolute',
    borderColor: colors.white,
    borderWidth: 3,
    width: 12.5,
    height: 12.5,
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
    const {
      navigation: {
        goBack,
        state: {
          params: { qrCodeResult },
        },
      },
    } = this.props;
    if (qrCodeResult(qrResults.data)) {
      goBack();
    } else {
      // display error
      goBack();
    }
  };

  _onClose = () => {
    const {
      navigation: { goBack },
    } = this.props;
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
        {t('qrscan.notauthorized')}
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
          reactivate
          reactivateTimeout={2000}
          cameraProps={{ captureAudio: false }}
        />
      </View>
    );
  }
}

QRScan.propTypes = {
  navigation: PropTypes.shape({}).isRequired,
};

export default withLocaleContext(QRScan);
