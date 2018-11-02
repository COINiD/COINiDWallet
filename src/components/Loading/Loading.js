import React from 'react';
import PropTypes from 'prop-types';
import { View, ActivityIndicator } from 'react-native';
import styles from './styles';

const Loading = (props) => {
  const { children } = props;
  
  return (
    <View style={styles.container}>
      <ActivityIndicator
        animating
        size={props.size}
        {...props}
      />
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
