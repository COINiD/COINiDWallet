import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import { Text } from '../components';

const styles = StyleSheet.create({
  container: {
    padding: 50,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 49,
    marginTop: 26,
    marginBottom: 44,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '300',
    marginBottom: 10,
    textAlign: 'center',
  },
});

class Build extends PureComponent {
  render() {
    const { status } = this.props;

    return (
      <View style={styles.container}>
        <KeepAwake />
        <ActivityIndicator animating size="large" />
        <Text style={styles.title}>Setting up your wallet</Text>
        <Text style={styles.text}>Your wallet will soon be ready.</Text>
        <Text style={styles.text}>{status}</Text>
      </View>
    );
  }
}

Build.propTypes = {
  status: PropTypes.string.isRequired,
};

export default Build;
