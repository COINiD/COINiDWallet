import { Platform } from 'react-native';
import { ifSmallDevice } from '../utils/device';

export const colors = {
  transparent: 'transparent',
  black: '#000000',
  white: '#FFFFFF',
  orange: '#FA503C',
  lightOrange: '#FF7A00',
  gray: '#8A8A8F',
  red: '#FA503C',
  lightGray: '#D8D8D8',
  lighterGray: '#EDEDED',
  green: '#00D6B0',
  darkGreen: '#0AA49A',
  lightBlue: '#0F73EE',
  lighterBlue: '#65E1FB',
  blue: '#1DACFC',
  darkGray: '#2A2937',
  yellow: '#FFCA7A',
  purple: '#617AF7',

  getHot: () => colors.yellow,
  getCold: () => colors.lighterBlue,
  getPrimary: () => colors.white,
  getSecondary: () => colors.orange,
  getText: () => colors.darkGray,
  getLightText: () => colors.gray,
  getLink: () => colors.lightBlue,
  getBorder: () => colors.lightGray,
  getIncoming: () => colors.green,
  getOutgoing: () => colors.orange,
  getOnline: () => colors.green,
  getOffline: () => colors.orange,
  getAlphaBg: () => 'rgba(0,0,0,0.8)',

  getTheme: (theme) => {
    if (theme === 'light') {
      return {
        background: colors.white,
        text: colors.black,
        fadedText: colors.gray,
        button: colors.purple,
        disabledButton: colors.lightGray,
        buttonText: colors.white,
        border: colors.lightGray,
        linkButton: colors.transparent,
        linkButtonText: colors.lightBlue,
        cancelButton: colors.red,
        cancelButtonText: colors.white,
        altCancelButton: colors.transparent,
        altCancelButtonText: colors.red,
        trashButton: colors.darkGray,
        trashButtonText: colors.white,
        highlight: colors.purple,
        paginationDot: colors.yellow,
        positive: colors.green,
        altPositive: colors.darkGreen,
        negative: colors.red,
        warning: colors.red,
        seeThrough: 'rgba(255,255,255,0.95)',
      };
    }

    return {
      background: colors.darkGray,
      text: colors.white,
      fadedText: colors.gray,
      button: colors.purple,
      buttonText: colors.white,
      disabledButton: colors.lightGray,
      border: 'rgba(0,0,0,0.5)',
      cancelButton: colors.red,
      cancelButtonText: colors.white,
      altCancelButton: colors.transparent,
      altCancelButtonText: colors.red,
      trashButton: colors.darkGray,
      trashButtonText: colors.white,
      highlight: colors.purple,
      paginationDot: colors.lighterBlue,
      positive: colors.green,
      altPositive: colors.green,
      negative: colors.red,
      warning: colors.red,
      seeThrough: 'rgba(42, 41, 55, 0.95)',
    };
  },
};

export const fontSize = ifSmallDevice(
  {
    h1: 32,
    large: 22,
    h2: 18,
    h3: 16,
    h4: 15,
    base: 14,
    small: 14,
    smaller: 12,
  },
  {
    h1: 40,
    large: 28,
    h2: 22,
    h3: 18,
    h4: 17,
    base: 16,
    small: 14,
    smaller: 12,
  },
);

export const fontStack = {
  primary: Platform.OS === 'android' ? 'Inter-UI' : 'Inter UI',
  book: 'Inter-UI-Book',
  medium: 'Inter-UI-Medium',
  bold: 'Inter-UI-Bold',
  black: 'Inter-UI-Black',
};

export const buttonSize = {
  slim: 38,
  normal: 54,
  big: 64,
};

export const fontWeight = Platform.OS === 'android'
  ? {
    book: { fontFamily: fontStack.book },
    normal: { fontFamily: fontStack.primary },
    medium: { fontFamily: fontStack.medium },
    bold: { fontFamily: fontStack.bold },
    black: { fontFamily: fontStack.black },
  }
  : {
    book: { fontWeight: '300' },
    normal: { fontWeight: '400' },
    medium: { fontWeight: '500' },
    bold: { fontWeight: '700' },
    black: { fontWeight: '900' },
  };

export const gridMultiplier = ifSmallDevice(4, 8);

export const layout = {
  paddingTop: gridMultiplier * 2,
  paddingBottom: gridMultiplier * 2,
  paddingLeft: gridMultiplier * 2,
  paddingRight: gridMultiplier * 2,
};

export const modal = {
  overlay: {
    backgroundColor: 'transparent',
    height: null,
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.getPrimary(),
    borderRadius: 10,
    flexDirection: 'column',
    margin: 8,
  },
  modalContent: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    marginBottom: 24,
    textAlign: 'center',
    ...fontWeight.bold,
  },
  closeIconContainer: {
    position: 'absolute',
    zIndex: 10,
    right: 19,
    top: 19,
    margin: 0,
    padding: 0,
  },
  closeIconFont: {
    fontSize: 21,
  },
};
