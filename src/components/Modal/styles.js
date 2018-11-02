import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 10,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visible: { },
  hidden: {
    transform: [{ translateX: -9999 }],
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    top: 0,
    bottom: -100,
    right: 0,
    left: 0,
  },
  dialog: {
    width: '100%',
    overflow: 'hidden',
    maxHeight: '100%',
  },
});
