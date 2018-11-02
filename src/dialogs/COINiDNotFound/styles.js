import { StyleSheet } from 'react-native';
import { colors, fontWeight } from '../../config/styling';

export default StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinidIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  text: {
    marginBottom: 24,
    fontSize: 16,
    color: '#000',
    ...fontWeight.normal,
  },
});
