import { StyleSheet } from 'react-native';
import parentStyles from '../modalStyles';
import settingsStyles from '../settingsStyles';
import styleMerge from '../../utils/styleMerge';

export default theme =>
  styleMerge(parentStyles(theme), settingsStyles(theme), StyleSheet.create({}));
