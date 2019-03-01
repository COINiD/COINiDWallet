/**
 * Merges the styles
 */

import { StyleSheet } from 'react-native';

const styleMerge = function(parentStyles, style) {
  var merged = {...parentStyles, ...style};

  for(var k in merged) {
    merged[k] = ({...StyleSheet.flatten(parentStyles[k]), ...StyleSheet.flatten(merged[k])});
  }

  return StyleSheet.create(merged);
}

export default styleMerge;
