import { StyleSheet } from 'react-native';
import { colors } from '../../config/styling';

export default StyleSheet.create({
  container: {
    marginBottom: -16
  },
  box: {
    height: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 8,
    paddingLeft: 16,
    paddingRight: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  boxSelected: {
    backgroundColor: 'rgba(97, 122, 247, 0.1)'
  },
  title: {
    fontSize: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
  }
});
