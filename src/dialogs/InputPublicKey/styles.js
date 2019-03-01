import { StyleSheet } from 'react-native';
import { fontWeight } from '../../config/styling';
import parentStyles from '../dialogStyles';
import styleMerge from '../../utils/styleMerge';

export default styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: 16,
      paddingTop: 0,
    },
    text: {
      marginBottom: 24,
      fontSize: 16,
      color: '#000',
      ...fontWeight.normal,
    },
  }),
);
