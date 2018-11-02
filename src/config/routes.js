import { createStackNavigator } from 'react-navigation';
import { QRScan, Settings, Home, QRDataReceiver } from '../screens';

function forVertical(props) {
  const { layout, position, scene } = props;
  const { index } = scene;

  const height = layout.initHeight;
  const translateY = position.interpolate({
    inputRange: ([index - 1, index, index + 1]: Array<number>),
    outputRange: ([height, 0, 0]: Array<number>),
  });

  const opacity = position.interpolate({
    inputRange: [index, index + 0.8, index + 1],
    outputRange: [1, 1, 0.6],
  });

  const scale = position.interpolate({
    inputRange: [index, index + 1],
    outputRange: [1, 1],
  });

  return {
    transform: [{ translateY }, { scale }],
    opacity,
  };
}

export const HomeStack = createStackNavigator(
  {
    Home: { screen: Home },
    QRScan: { screen: QRScan },
    QRDataReceiver: { screen: QRDataReceiver },
    Settings: {
      screen: Settings,
      swipeEnabled: false,
    },
  },
  {
    headerMode: 'none',
    mode: 'modal',
    cardStyle: { backgroundColor: 'rgba(0, 0, 0, 0.0)' },
    transitionConfig: () => ({ screenInterpolator: forVertical }),
  },
);
