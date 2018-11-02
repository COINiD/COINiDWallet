import { StyleSheet } from 'react-native';
import { colors, fontWeight } from '../../config/styling';
import styleMerge from '../../utils/styleMerge';
import parentStyles from '../dialogStyles';

export default styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    summaryContainer: {
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      zIndex: 100,
      position: 'relative',
      marginBottom: -16,
      paddingBottom: 16,
    },
    batchedHeaderContainer: {
      marginTop: -16,
      paddingTop: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      width: '100%',
      zIndex: 100,
      position: 'relative',
    },
    batchedHeader: {
      color: colors.getTheme('light').fadedText,
      marginBottom: 8,
      ...fontWeight.medium,
    },
  })
);
