import { Dimensions, Platform } from 'react-native';

const SMALL_SCREEN_HEIGHT = 640;

export const ifAndroid = (android, ios) => {
  if (Platform.OS === 'android') {
    return android;
  } else {
    return ios;
  }
};

export const ifSmallDevice = (small, regular) => {
  const { height } = Dimensions.get('window');
  if (height < SMALL_SCREEN_HEIGHT) {
    return small;
  } else {
    return regular;
  }
};

export const isSmallDevice = (small, regular) => {
  const { height } = Dimensions.get('window');
  return height < SMALL_SCREEN_HEIGHT;
};
