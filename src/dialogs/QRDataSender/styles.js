import { StyleSheet } from 'react-native';
import { colors, fontWeight } from '../../config/styling';

export default StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 0,
  },
  blockContainer: {
    marginLeft: -3,
    flexDirection: 'row',
  },
  block: {
    backgroundColor: '#DADADA',
    height: 6,
    flex: 1,
    marginLeft: 3,
    marginTop: 19,
  },
  activeBlock: {
    backgroundColor: '#617AF7',
  },
  noBlockMargin: {
    marginLeft: 0,
  },
});
