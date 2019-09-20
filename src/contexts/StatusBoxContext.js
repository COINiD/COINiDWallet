import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { Icon } from 'react-native-elements';

import Text from '../components/Text';
import DismissableByDragView from '../components/DismissableByDragView';

import { colors, fontWeight, fontSize } from '../config/styling';

const StatusContext = React.createContext({});

const BOX_HEIGHT = 48;
const OUTER_PADDING = 8;

const styles = StyleSheet.create({
  container: {
    marginBottom: getBottomSpace(),
    padding: OUTER_PADDING,
  },
  box: {
    backgroundColor: colors.otherGray,
    flex: 1,
    height: BOX_HEIGHT,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { height: 2, width: 0 },
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  boxSpacedItems: {
    justifyContent: 'space-between',
  },
  text: {
    ...fontWeight.medium,
    fontSize: fontSize.small,
    color: colors.white,
  },
  link: {
    color: colors.getTheme('light').highlight,
    marginRight: 1,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

class StatusBox extends PureComponent {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
    linkText: PropTypes.string,
    linkIcon: PropTypes.string,
    linkIconType: PropTypes.string,
    onLinkPress: PropTypes.func,
  };

  static defaultProps = {
    children: null,
    linkText: '',
    linkIcon: '',
    linkIconType: '',
    onLinkPress: () => {},
  };

  _renderChildren = () => {
    const { children } = this.props;

    if (typeof children === 'string') {
      return <Text style={styles.text}>{children}</Text>;
    }

    return children;
  };

  _shouldRenderLink = () => {
    const { linkText, linkIcon } = this.props;

    return linkText || linkIcon;
  };

  _renderLink = () => {
    const {
      linkText, linkIcon, linkIconType, onLinkPress,
    } = this.props;

    const renderLinkText = () => {
      if (!linkText) {
        return null;
      }

      return <Text style={[styles.text, styles.link]}>{linkText}</Text>;
    };

    const renderLinkIcon = () => {
      if (!linkIcon) {
        return null;
      }

      return (
        <Icon
          name={linkIcon}
          color={colors.getTheme('light').highlight}
          size={26}
          type={linkIconType}
        />
      );
    };

    return (
      <TouchableOpacity style={styles.linkContainer} onPress={onLinkPress}>
        {renderLinkText()}
        {renderLinkIcon()}
      </TouchableOpacity>
    );
  };

  _renderBox = () => {
    if (!this._shouldRenderLink()) {
      return <View style={[styles.box]}>{this._renderChildren()}</View>;
    }

    return (
      <View style={[styles.box, styles.boxSpacedItems]}>
        {this._renderChildren()}
        {this._renderLink()}
      </View>
    );
  };

  render() {
    return <View style={styles.container}>{this._renderBox()}</View>;
  }
}

class StatusBoxProvider extends PureComponent {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  };

  static defaultProps = {
    children: null,
  };

  constructor() {
    super();

    this.dismissableView = React.createRef();

    this.state = {
      statusContent: null,
      value: { showStatus: this._showStatus },
    };
  }

  _showStatus = async (statusContent, statusProps) => {
    const { current: dismissableView } = this.dismissableView;
    if (dismissableView && dismissableView.dismiss) {
      await dismissableView.dismiss();
    }

    this.setState({
      statusContent,
      statusProps,
    });
  };

  _onHide = () => {
    this.setState({
      statusContent: null,
    });
  };

  _renderStatusBox = () => {
    const { statusContent, statusProps } = this.state;

    const doRender = () => {
      if (!statusContent) {
        return null;
      }

      const { hideAfter = 1600 } = statusProps;

      return (
        <DismissableByDragView
          ref={this.dismissableView}
          slide="slideBottom"
          onHide={this._onHide}
          showTime={hideAfter}
        >
          <StatusBox {...statusProps} onHide={this._onHide}>
            {statusContent}
          </StatusBox>
        </DismissableByDragView>
      );
    };

    if (Platform.OS === 'ios') {
      return <KeyboardAvoidingView behavior="position">{doRender()}</KeyboardAvoidingView>;
    }
    return doRender();
  };

  render() {
    const { children } = this.props;
    const { value } = this.state;

    return (
      <StatusContext.Provider value={value}>
        {children}
        {this._renderStatusBox()}
      </StatusContext.Provider>
    );
  }
}

export const withStatusBox = (WrappedComponent) => {
  const Enhance = React.forwardRef((props, ref) => (
    <StatusContext.Consumer>
      {statusBoxContext => (
        <WrappedComponent {...props} ref={ref} statusBoxContext={statusBoxContext} />
      )}
    </StatusContext.Consumer>
  ));
  return Enhance;
};

export default {
  ...StatusContext,
  Provider: StatusBoxProvider,
};
