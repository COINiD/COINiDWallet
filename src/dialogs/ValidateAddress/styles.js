import { StyleSheet } from 'react-native';
import { colors, fontStack, fontWeight } from '../../config/styling';

export default StyleSheet.create({
  // Default modal style
  overlay: {
    backgroundColor: 'transparent',
    height: null,
  },
  container: {
    marginBottom: 11,
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#FA503C',
  },
  textContainer: {
    marginBottom: 24,
    textAlign: 'center',
  },
});
