import { StyleSheet } from 'react-native';
import { colors, fontStack, fontWeight } from '../../config/styling';

export default StyleSheet.create({
  text: {
    fontSize: 14,
    color: '#000000',
    ...fontWeight.normal,
  },
  header: {
    fontSize: 16,
    color: '#000000',
  },
  content: {
    height: 56,
    justifyContent: 'center',
  },
  touch: {
    paddingHorizontal: 16,
  },
  container: {
    marginHorizontal: -8,
    backgroundColor: '#FA503C',
    borderRadius: 10,
    shadowRadius: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.18,
  },
});
