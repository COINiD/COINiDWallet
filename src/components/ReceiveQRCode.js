import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  PixelRatio,
  Clipboard,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import { FontScale, Text } from '.';
import { colors, fontSize, fontWeight } from '../config/styling';

const styles = StyleSheet.create({
  qrCode: {
    padding: 8,
    backgroundColor: colors.white,
  },
  qrCodeWrapper: {
    marginTop: 4,
    marginBottom: 16,
    height: 160,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addressText: {
    fontSize: fontSize.small,
    textAlign: 'center',
  },
  statusBox: {
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: colors.purple,
    fontSize: fontSize.small,
  },
});

class ReceiveQRCode extends PureComponent {
  static propTypes = {
    address: PropTypes.string,
    qrAddress: PropTypes.string,
    getViewShot: PropTypes.func,
  };

  static defaultProps = {
    address: '',
    qrAddress: '',
    getViewShot: () => {},
  };

  constructor() {
    super();

    this.state = {
      animated: new Animated.Value(0),
      nativeAnimated: new Animated.Value(0),
      disableCopy: false,
    };
  }

  _copyAddress = () => {
    const { address } = this.props;
    Clipboard.setString(address);

    this._showCopiedStatus();
  };

  _showCopiedStatus = () => {
    this.setState({ disableCopy: true });

    this._animateValue(1, () => {
      setTimeout(this._hideCopiedStatus, 1000);
    });
  };

  _hideCopiedStatus = () => {
    this._animateValue(0, () => {
      this.setState({ disableCopy: false });
    });
  };

  _animateValue = (toValue, cb) => {
    const { animated, nativeAnimated } = this.state;

    Animated.timing(animated, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start(cb);

    Animated.timing(nativeAnimated, {
      toValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  render() {
    const { animated, nativeAnimated, disableCopy } = this.state;
    const { getViewShot, qrAddress, address } = this.props;

    const animatedStatusStyle = {
      height: animated.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 32],
      }),
      marginTop: animated.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 16],
      }),
    };

    const nativeAnimatedStatusStyle = {
      opacity: nativeAnimated.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    };

    return (
      <React.Fragment>
        <TouchableOpacity onPress={this._copyAddress} disabled={disableCopy}>
          <View style={styles.qrCodeWrapper}>
            <ViewShot
              ref={getViewShot}
              options={{
                format: 'png',
                result: Platform.OS === 'ios' ? 'tmpfile' : 'data-uri',
                width: parseInt(320 / PixelRatio.get(), 10),
                height: parseInt(320 / PixelRatio.get(), 10),
              }}
            >
              <View style={styles.qrCode}>
                <QRCode value={qrAddress} size={160} ecl="Q" />
              </View>
            </ViewShot>
          </View>

          <FontScale fontSizeMax={fontSize.small} fontSizeMin={8} text={address} widthScale={0.9}>
            {({ fontSize: scaledFontSize }) => (
              <Text style={[styles.addressText, { fontSize: scaledFontSize }]} selectable>
                {address}
              </Text>
            )}
          </FontScale>
        </TouchableOpacity>
        <Animated.View style={[nativeAnimatedStatusStyle]}>
          <Animated.View style={[styles.statusBox, animatedStatusStyle]}>
            <Text style={styles.statusText}>Address copied!</Text>
          </Animated.View>
        </Animated.View>
      </React.Fragment>
    );
  }
}

export default ReceiveQRCode;
