import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { DialogTitle, Modal } from '.';

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 10,
    backgroundColor: '#FFF',
    width: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    alignSelf: 'center',
  },
});

export default class DetailsModal extends PureComponent {
  _open = () => {
    this.elModal._open();
  };

  _close = () => {
    this.elModal._close();
  };

  _setKeyboardOffset = (offset) => {
    this.elModal._setKeyboardOffset(offset);
  };

  render() {
    const {
      showMoreOptions, onMoreOptions, onLayout, onOuterLayout, children, title,
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
            {children}
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
};
