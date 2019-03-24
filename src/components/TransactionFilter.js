import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, TextInput, Animated, Easing,
} from 'react-native';
import { Icon, ButtonGroup } from 'react-native-elements';
import { colors } from '../config/styling';

const themedStyleGenerator = theme => StyleSheet.create({
  container: {
    marginLeft: -16,
    marginRight: -16,
    paddingLeft: 16,
    paddingRight: 16,
    overflow: 'visible',
  },
  listHeader: {
    paddingTop: 16,
    paddingBottom: 10,
  },
  listHeaderTop: {
    flexDirection: 'row',
    zIndex: 15,
  },
  listHeaderFilter: {
    height: 91,
    top: -91,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: colors.getTheme(theme).seeThrough,
    paddingBottom: 10,
  },
  filterIcon: {
    color: colors.gray,
  },
  filterIconCont: {
    position: 'absolute',
    bottom: 7,
    left: 6,
    zIndex: 11,
  },
  filterTextInput: {
    width: '100%',
    backgroundColor: colors.lighterGray,
    color: colors.gray,
    height: 36,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 31,
    paddingRight: 26,
    borderRadius: 11,
    fontSize: 17,
    zIndex: 10,
  },
  buttonGroup: {
    borderRadius: 4,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 16,
    marginBottom: 0,
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.getTheme(theme).button,
    padding: 0,
    height: 29,
  },
  buttonGroupInnerBorder: {
    color: colors.getTheme(theme).button,
  },
  buttonGroupText: {
    color: '#617AF7',
    fontSize: 14,
  },
  buttonGroupSelectedText: {
    color: colors.getTheme(theme).buttonText,
  },
});

export default class TransactionFilter extends PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func,
    txItemsOffset: PropTypes.shape({}).isRequired,
  };

  static contextTypes = {
    theme: PropTypes.string,
  };

  static defaultProps = {
    onFocus: () => {},
  };

  constructor(props, context) {
    super(props);

    const { txItemsOffset } = this.props;

    const { theme } = context;
    const styles = themedStyleGenerator(theme);

    this.currentFilters = {
      text: '',
      type: 'all',
    };

    this.filterTypes = [
      { title: 'All', key: 'all' },
      { title: 'Sent', key: 'sent' },
      { title: 'Received', key: 'received' },
    ];
    this.filterTypeTitles = this.filterTypes.map(e => e.title);

    this.state = {
      filterText: '',
      height: 0,
      top: txItemsOffset,
      selectedFilterType: 0,
      styles,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { isOpen } = this.props;

    if (nextProps.isOpen !== isOpen) {
      if (nextProps.isOpen) {
        this._doOpen();
      } else {
        this._doClose();
      }
    }
  }

  onChangeText = (filterText) => {
    this.setState({ filterText });
    this.setFilterChange({ text: filterText });
  };

  setFilterChange = (filterChange) => {
    const { onFilterChange } = this.props;

    this.currentFilters = { ...this.currentFilters, ...filterChange };

    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      onFilterChange(this.currentFilters);
    }, 100);
  };

  _doClose = () => {
    const { top } = this.state;
    const { changedHeight } = this.props;

    this.isOpen = false;

    Animated.timing(top, {
      toValue: 0,
      duration: 350,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      if (!this.isOpen) {
        this.setState({
          height: 0,
        });

        changedHeight(0);
      }
    });
  };

  _doOpen = () => {
    const { top } = this.state;
    const { changedHeight } = this.props;

    this.isOpen = true;

    this.setState({
      height: 91,
    });

    changedHeight(91);

    Animated.timing(top, {
      toValue: 91,
      duration: 350,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  _updateFilterType = (selectedFilterType) => {
    this.setState({ selectedFilterType });
    const filterType = this.filterTypes[selectedFilterType].key;
    this.setFilterChange({ type: filterType });
  };

  render() {
    const {
      styles, height, top, filterText, selectedFilterType,
    } = this.state;
    const { onFocus } = this.props;
    const { theme } = this.context;

    return (
      <View
        style={{
          position: 'relative',
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height,
            borderRadius: 0,
            top: 0,
            overflow: 'hidden',
            zIndex: 20,
          }}
        >
          <Animated.View style={[styles.listHeaderFilter, { transform: [{ translateY: top }] }]}>
            <View style={{ overflow: 'hidden' }}>
              <TextInput
                style={styles.filterTextInput}
                value={filterText}
                onChangeText={this.onChangeText}
                placeholder="Search"
                placeholderTextColor={colors.gray}
                onFocus={onFocus}
                underlineColorAndroid="transparent"
              />

              <Icon
                name="search"
                iconStyle={styles.filterIcon}
                containerStyle={styles.filterIconCont}
                size={22}
              />
            </View>
            <ButtonGroup
              selectedIndex={selectedFilterType}
              onPress={this._updateFilterType}
              buttons={this.filterTypeTitles}
              containerStyle={styles.buttonGroup}
              underlayColor={colors.transparent}
              disableSelected
              innerBorderStyle={styles.buttonGroupInnerBorder}
              selectedBackgroundColor={colors.getTheme(theme).button}
              textStyle={styles.buttonGroupText}
              selectedTextStyle={styles.buttonGroupSelectedText}
            />
          </Animated.View>
        </View>
      </View>
    );
  }
}
