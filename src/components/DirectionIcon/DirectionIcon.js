import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'react-native-elements';
import styles from './styles';
import { colors } from '../../config/styling'

const DirectionIcon = (props) => {
  const { direction } = props;
  
  const getColor = () => {
    if (direction == 'incoming') {
      return colors.getIncoming()
    } else {
      return colors.getOutgoing()
    }
  }
  
  const getArrow = () => {
    if (direction == 'incoming') {
      return 'arrow-forward'
    } else {
      return 'arrow-back'
    }
  }
  
  return (
    <Icon
      reverse
      name={getArrow()}
      size={12}
      color={getColor()}
      iconStyle={styles.icon}
      containerStyle={styles.container} />
  );
};

DirectionIcon.propTypes = {
};

DirectionIcon.defaultProps = {
};

export default DirectionIcon;
