import { StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../../config/styling';
import styleMerge from '../../utils/styleMerge';
import parentStyles from '../dialogStyles';

export default styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    deleteIcon: {
      color: '#FFFFFF',
      fontSize: 21,
    },
    deleteIconContainer: {
      // marginLeft: -10
    },
  }),
);
