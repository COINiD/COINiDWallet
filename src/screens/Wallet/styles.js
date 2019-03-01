import { StyleSheet } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';

import { colors } from '../../config/styling';
import styleMerge from '../../utils/styleMerge';

export default (theme) => styleMerge(StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.getTheme(theme).background,
    borderRadius: 16,
    ...ifIphoneX({
      paddingBottom: 34,
    }, { })
  }
}));
