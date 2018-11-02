import { StyleSheet } from 'react-native';
import { colors, fontStack, fontWeight } from '../../config/styling';

export default StyleSheet.create({
  // Default modal style
  overlay: {
    backgroundColor: 'transparent',
    height: null,
  },
  container: {
    marginBottom: 3,
    marginHorizontal: 2,
  },
  buttonGroup: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 5,
  },
  button: {
    backgroundColor: 'rgba(248, 248, 248, 0.82)',
    height: 57,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleButton: {
    backgroundColor: '#FFF',
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 20,
    ...fontWeight.normal,
  },
  seperator: {
    backgroundColor: '#717181',
    height: 0.5,
  },
});
