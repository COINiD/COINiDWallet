import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const Loading = (props) => {
  const { children } = props;

  return (
    <View style={styles.container}>
      <ActivityIndicator animating size={props.size} {...props} />
      {children}
    </View>
  );
};

Loading.propTypes = {
  size: PropTypes.string,
};

Loading.defaultProps = {
  size: 'large',
};

export default Loading;
