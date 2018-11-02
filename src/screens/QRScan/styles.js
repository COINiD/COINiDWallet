import { StyleSheet } from 'react-native';
import { colors } from '../../config/styling';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
    position: 'relative',
  },
  wrapper: {
    flex: 1,
    backgroundColor: colors.black,
  },
  topView: {
    position: 'absolute',
    zIndex: 1000,
    margin: 0,
    padding: 0,
    height: 100,
  },

  bottomView: {
    backgroundColor: 'transparent',
    bottom: 0,
    flex: 0,
    height: 100,
    padding: 0,
    position: 'absolute',
    flexDirection: 'row',
  },

  iconContainer: {
    padding: 20,
    marginLeft: 8,
    marginRight: 8,
  },

  closeIconContainer: {
    position: 'absolute',
    right: 16,
    top: 28,
    backgroundColor: colors.darkGray,
    borderRadius: 8,
    width: 48,
    height: 48,
    margin: 0,
  },

  markerContainer: {
    position: 'relative',
    width: 264,
    height: 264,
  },

  markerCorner: {
    position: 'absolute',
    borderColor: colors.white,
    borderWidth: 3,
    width: 12.5,
    height: 12.5,
  },

  markerTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },

  markerTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },

  markerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },

  markerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
});
