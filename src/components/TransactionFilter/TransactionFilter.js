import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, TextInput, Animated, Easing } from 'react-native';
import { Icon, ButtonGroup } from 'react-native-elements';
import themeableStyles from './styles';
import { colors } from '../../config/styling';

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

  constructor(props) {
    super(props);

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
      top: this.props.txItemsOffset,
      selectedFilterType: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOpen !== this.props.isOpen) {
      if (nextProps.isOpen) {
        this.doOpen();
      } else {
        this.doClose();
      }
    }
  }

  onChangeText = (filterText) => {
    this.setState({ filterText });
    this.setFilterChange({ text: filterText });
  };

  getStyle = () => themeableStyles(this.getTheme());

  getTheme = () => {
    const { theme } = this.context;
    return theme;
  };

  setFilterChange = (filterChange) => {
    this.currentFilters = { ...this.currentFilters, ...filterChange };

    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.props.onFilterChange(this.currentFilters);
    }, 100);
  };

  doClose = () => {
    this.isOpen = false;

    Animated.timing(this.state.top, {
      toValue: 0,
      duration: 250,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      if (!this.isOpen) {
        this.setState({
          height: 0,
        });

        this.props.changedHeight(0);
      }
    });
  };

  doOpen = () => {
    this.isOpen = true;

    this.setState({
      height: 91,
    });

    this.props.changedHeight(91);

    Animated.timing(this.state.top, {
      toValue: 91,
      duration: 250,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  updateFilterType = (selectedFilterType) => {
    this.setState({ selectedFilterType });
    const filterType = this.filterTypes[selectedFilterType].key;
    this.setFilterChange({ type: filterType });
  };

  render() {
    const styles = this.getStyle();
    const theme = this.getTheme();

    return (
      <View style={{
          position: 'relative',
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: this.state.height,
            borderRadius: 0,
            top: 0,
            overflow: 'hidden',
            zIndex: 20
          }}
        >
          <Animated.View
            style={[styles.listHeaderFilter, { transform: [{ translateY: this.state.top }] }]}
          >
              <View style={{ overflow: 'hidden' }}>
                <TextInput
                  style={styles.filterTextInput}
                  value={this.state.filterText}
                  onChangeText={this.onChangeText}
                  placeholder="Search"
                  placeholderTextColor={colors.gray}
                  onFocus={this.props.onFocus}
                  underlineColorAndroid="transparent"
                />

                <Icon name="search" iconStyle={styles.filterIcon} containerStyle={styles.filterIconCont} size={22} />

              </View>
              <ButtonGroup
                selectedIndex={this.state.selectedFilterType}
                onPress={this.updateFilterType}
                buttons={this.filterTypeTitles}
                containerStyle={{
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
                }}
                underlayColor={colors.transparent}
                disableSelected
                innerBorderStyle={{
                  color: colors.getTheme(theme).button,
                }}
                selectedBackgroundColor={colors.getTheme(theme).button}
                textStyle={{
                  color: '#617AF7',
                  fontSize: 14,
                }}
                selectedTextStyle={{
                  color: colors.getTheme(theme).buttonText,
                }}
              />
          </Animated.View>
        </View>
      </View>
    );
  }
}
