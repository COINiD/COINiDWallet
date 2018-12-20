import { StyleSheet, Platform } from 'react-native';
import { colors, fontSize, fontWeight } from '../../config/styling';
import settings from '../../config/settings';
import { ifIphoneX } from 'react-native-iphone-x-helper';

export default StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? ifIphoneX(-44, -20) : 0, // statusbar compensation...
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000
  },
  logoWrapper: {
    position: 'absolute',
    bottom: 27,
    width: 113,
    height: 37,
    alignSelf: 'center',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  walletLogoWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletLogo: {
    width: 212,
    height: 212,
    marginLeft: 1,
    marginBottom: settings.isTestnet ? 0 : 32,
  },
  unlockButtonWrapper: {
    position: 'absolute',
    width: '100%',
    bottom: '16.34182909%',
    overflow: 'visible',
    alignItems: 'center',
  },
  unlockButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.getTheme('light').button,
    shadowRadius: 20,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTextWrapper: {
    position: 'absolute',
    top: 16,
    alignItems: 'center',
    width: '100%',
  },
  lockText: {
    color: colors.white,
    fontSize: fontSize.smaller,
    ...fontWeight.medium,
  },
  testnetText: {
    color: colors.white,
    fontSize: fontSize.small,
    ...fontWeight.medium,
    alignSelf: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});
