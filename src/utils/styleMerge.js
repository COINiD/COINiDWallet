/**
 * Merges the styles
 */

import { StyleSheet } from 'react-native';
import { memoize } from './generic';

const styleMerge = memoize((parentStyles, style) => {
  const merged = { ...parentStyles, ...style };

  for (const k in merged) {
    merged[k] = { ...StyleSheet.flatten(parentStyles[k]), ...StyleSheet.flatten(merged[k]) };
  }

  return StyleSheet.create(merged);
});

export default styleMerge;
