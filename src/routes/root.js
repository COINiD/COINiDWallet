import { createStackNavigator } from 'react-navigation';
import {
  Home, QRScan, QRDataReceiver, Settings,
} from '../screens';

const rootScreenInterpolator = (props) => {
  const { layout, position, scene } = props;
  const { index } = scene;

  const height = layout.initHeight;
  const translateY = position.interpolate({
    inputRange: ([index - 1, index, index + 1]: Array<number>),
    outputRange: ([height, 0, -28]: Array<number>),
  });

  const scale = position.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [1, 1, 0.91],
  });

  const {
    route: { params },
  } = scene;

  if (params && params.setScreenAnimator) {
    params.setScreenAnimator({ position, layout });
  }

  return {
    transform: [{ translateY }, { scale }],
    //  opacity,
  };
};

export const rootRoutes = {
  Home: { screen: Home },
  QRScan: { screen: QRScan },
  QRDataReceiver: { screen: QRDataReceiver },
  Settings: {
    screen: Settings,
    swipeEnabled: false,
  },
};

export const RootNavigator = createStackNavigator(rootRoutes, {
  headerMode: 'none',
  mode: 'modal',
  cardStyle: { backgroundColor: 'rgba(0, 0, 0, 0.0)' },
  transitionConfig: () => ({ screenInterpolator: rootScreenInterpolator }),
});
