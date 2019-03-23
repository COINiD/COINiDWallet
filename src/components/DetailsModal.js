import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { DialogTitle, Modal } from '.';

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginBottom: getBottomSpace(),
    width: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    alignSelf: 'center',
  },
});

export default class DetailsModal extends PureComponent {
  _open = (cb) => {
    this.elModal._open(cb);
  };

  _close = (cb) => {
    this.elModal._close(cb);
  };

  _setKeyboardOffset = (offset) => {
    this.elModal._setKeyboardOffset(offset);
  };

  _renderChildren = () => {
    const { children, currentDialog } = this.props;

    if (Array.isArray(children)) {
      return children.map((dialog, i) => {
        if (currentDialog === i) {
          return <View key={dialog.key}>{dialog}</View>;
        }
        return (
          <View key={dialog.key} style={{ display: 'none' }}>
            {dialog}
          </View>
        );
      });
    }

    return children;
  };

  render() {
    const {
      showMoreOptions, onMoreOptions, onLayout, onOuterLayout, title,
    } = this.props;

    return (
      <Modal
        {...this.props}
        ref={(c) => {
          this.elModal = c;
        }}
        onLayout={onOuterLayout}
      >
        <View style={styles.dialog} onLayout={onLayout}>
          <DialogTitle
            title={title}
            closeFunc={this._close}
            showMoreOptions={showMoreOptions}
            onMoreOptions={onMoreOptions}
          />
          <View
            style={{
              marginTop: -56,
              paddingTop: 56,
              maxHeight: '100%',
            }}
          >
            {this._renderChildren()}
          </View>
        </View>
      </Modal>
    );
  }
}

DetailsModal.propTypes = {
  title: PropTypes.string,
  verticalPosition: PropTypes.string,
  showMoreOptions: PropTypes.bool,
  onMoreOptions: PropTypes.func,
  onClosed: PropTypes.func,
  onOpened: PropTypes.func,
  onLayout: PropTypes.func,
  onOuterLayout: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  currentDialog: PropTypes.number,
};

DetailsModal.defaultProps = {
  title: 'Untitled',
  verticalPosition: 'center',
  showMoreOptions: false,
  onMoreOptions: () => {},
  onClosed: () => {},
  onOpened: () => {},
  onLayout: () => {},
  onOuterLayout: () => {},
  children: null,
  currentDialog: 0,
};
