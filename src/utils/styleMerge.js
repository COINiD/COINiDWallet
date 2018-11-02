/**
 * Merges the styles
 */

import { StyleSheet } from 'react-native';

export default styleMerge = function(parentStyles, style) {
  var merged = {...parentStyles, ...style};

  for(k in merged) {
    merged[k] = ({...StyleSheet.flatten(parentStyles[k]), ...StyleSheet.flatten(merged[k])});
  }

  return StyleSheet.create(merged);
}
