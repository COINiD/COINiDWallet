import { StyleSheet } from 'react-native';
import { colors, fontWeight } from '../../config/styling';

export default StyleSheet.create({
  // Default modal style
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  icon: {
    fontSize: 16,
    marginRight: 4
  },
  text: {
    fontSize: 16,
    ...fontWeight.medium,
  },
  pending: {
    color: colors.orange
  },
  completed:{
    color: colors.green
  }
});
