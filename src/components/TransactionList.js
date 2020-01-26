import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SectionList,
  View,
  Animated,
  Platform,
} from 'react-native';

import { Icon } from 'react-native-elements';
import LottieView from 'lottie-react-native';
import Big from 'big.js';

import { Graph, Text, TransactionFilter } from '.';
import TranslatedText from './TranslatedText';
import { numFormat } from '../utils/numFormat';
import { withLocaleContext } from '../contexts/LocaleContext';
import { getTxBalanceChange } from '../libs/coinid-public/transactionHelper';
import { colors, fontWeight, fontSize } from '../config/styling';

import { memoize } from '../utils/generic';

const lottieFiles = {
  emptytrans_hot: require('../animations/emptytrans_hot.json'),
  emptytrans_cold: require('../animations/emptytrans_cold.json'),
  feather_cold: require('../animations/feather_cold.json'),
  feather_hot: require('../animations/feather_hot.json'),
  hourglass: require('../animations/hourglass.json'),
};

const themedStyleGenerator = memoize(theme => StyleSheet.create({
  batchedRowsContainer: {},
  batchedLine: {
    width: 2,
    backgroundColor: colors.getTheme(theme).fadedText,
    height: 10,
    left: 0,
    top: -4,
    borderRadius: 2,
    position: 'absolute',
  },
  container: {
    marginLeft: -16,
    marginRight: -16,
    paddingLeft: 16,
    paddingRight: 16,
    overflow: 'visible',
  },
  listHeader: {
    marginBottom: -3,
    overflow: 'visible',
    position: 'relative',
  },
  listHeaderTop: {
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    overflow: 'visible',
    backgroundColor: colors.getTheme(theme).seeThrough,
  },
  subHeader: {
    flex: 3,
    fontSize: fontSize.h2,
    ...fontWeight.bold,
  },
  subLink: {
    color: colors.getTheme(theme).highlight,
    flex: 2,
    textAlign: 'right',
  },

  itemWrapper: {},
  itemContainer: {
    paddingHorizontal: 3,
    marginBottom: 3,
    height: 56,
    flexDirection: 'row',
    flex: 1,
  },
  infoContainer: {
    flex: 4,
    justifyContent: 'center',
  },
  topContainer: {
    flexDirection: 'row',
    marginBottom: 7,
  },
  icon: {
    marginRight: 16,
    width: 24,
    justifyContent: 'center',
  },

  amountText: {
    flex: 5,
    lineHeight: 19,
    ...fontWeight.medium,
  },
  positiveAmount: {
    color: colors.getTheme(theme).altPositive,
  },
  negativeAmount: {},
  dateText: {
    flex: 1,
    textAlign: 'right',
  },
  smallText: {
    color: colors.getTheme(theme).fadedText,
    fontSize: fontSize.small,
    lineHeight: 19,
  },
  unconfirmedText: {
    color: colors.red,
  },
  pendingText: {
    color: colors.lightOrange,
  },
  filterIndicator: {
    position: 'absolute',
    right: 24,
    top: 8,
    height: 8,
    width: 8,
    backgroundColor: colors.getTheme(theme).button,
    borderRadius: 4,
  },
  paidFees: {
    fontSize: 14,
    color: '#8A8A8F',
    ...fontWeight.normal,
  },
  dailySummaryDate: { fontSize: 14, ...fontWeight.normal },
  dailySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 36,
  },
}));

const activeItems = {};

class TransactionListItem extends Component {
  constructor(props, context) {
    super(props);

    const { coinid, theme } = context;
    const styles = themedStyleGenerator(theme);

    this.noteHelper = coinid.noteHelper;

    const {
      txData, style, confirmations, languageTag,
    } = this.props;
    const [tx, address, balanceChanged, key] = txData;

    const itemKey = tx.txid + address + this.noteHelper.getBaseKey();

    this.propStyle = style;

    this.state = {
      tx,
      address,
      balanceChanged,
      key,
      confirmations,
      pendingProgress: new Animated.Value(0),
      confirmationOpacity: new Animated.Value(1),
      styles,
      languageTag,
    };

    activeItems[itemKey] = this;
  }

  componentDidMount() {
    const { confirmations } = this.state;

    this._loadNote();
    this._updateConfirmationAnimation(confirmations, true);
  }

  componentWillReceiveProps(nextProps) {
    const { txData, confirmations, languageTag } = nextProps;
    const [tx, address, balanceChanged, key] = txData;
    const { unPublished } = tx;
    const {
      confirmations: stateConfirmations,
      unPublished: stateUnPublished,
      languageTag: stateLanguageTag,
    } = this.state;

    if (
      confirmations !== stateConfirmations
      || unPublished !== stateUnPublished
      || languageTag !== stateLanguageTag
    ) {
      this._updateConfirmationAnimation(confirmations);

      this.setState({
        confirmations,
        tx,
        address,
        balanceChanged,
        key,
        unPublished,
        languageTag,
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      note, confirmations, unPublished, languageTag,
    } = nextState;

    const {
      unPublished: stateUnPublished,
      note: stateNote,
      confirmations: stateConfirmations,
      languageTag: stateLanguageTag,
    } = this.state;

    if (languageTag !== stateLanguageTag) {
      return true;
    }

    if (unPublished !== stateUnPublished) {
      return true;
    }

    if (note !== stateNote) {
      return true;
    }

    if (confirmations !== stateConfirmations) {
      return true;
    }

    return false;
  }

  componentWillUnmount() {
    const { tx, address } = this.state;

    const itemKey = tx.txid + address + +this.noteHelper.getBaseKey();
    delete activeItems[itemKey];
  }

  _updateConfirmationAnimation = (confirmations, instant) => {
    const { pendingProgress, confirmationOpacity } = this.state;
    const { _value: curVal } = pendingProgress;

    const newVal = this._percentDone(confirmations);

    Animated.timing(pendingProgress, {
      toValue: newVal,
      duration: instant ? 0 : 2400 * (newVal - curVal),
    }).start(() => {
      if (this._percentDone(confirmations) === 1) {
        Animated.timing(confirmationOpacity, {
          toValue: 0,
          duration: instant ? 0 : 400,
        }).start();
      }
    });
  };

  _onPress = (info) => {
    const { onPressItem } = this.props;
    onPressItem(info);
  };

  _percentDone = (confirmations) => {
    const {
      coinid: {
        network: { confirmations: recommendedConfirmations },
      },
    } = this.context;
    const percentage = parseInt((6 * confirmations) / recommendedConfirmations, 10) / 6;

    return percentage > 1 ? 1 : percentage;
  };

  _getDateString = () => {
    const {
      tx: { time },
    } = this.state;

    const { moment } = this.props;

    if (time) {
      return moment.unix(time).format('LT');
    }

    return moment().format('LT');
  };

  _loadNote = () => {
    const { tx, address } = this.state;
    this.noteHelper.loadNote(tx, address).then((note) => {
      if (note !== undefined) {
        this.setState({ note });
      }
    });
  };

  render() {
    const {
      note, tx, address, balanceChanged, key, confirmations, styles,
    } = this.state;

    const {
      type,
      coinid: { ticker, network },
    } = this.context;

    const renderCurrentState = () => {
      const { unPublished } = tx;
      const { confirmations: recommendedConfirmations } = network;
      const { pendingProgress, confirmationOpacity } = this.state;

      if (unPublished) {
        return (
          <View style={{ justifyContent: 'center', marginRight: 14 }}>
            <LottieView
              ref={(c) => {
                this.queueAnim = c;
              }}
              onLayout={() => {
                this.queueAnim.play();
              }}
              source={lottieFiles[`feather_${type}`]}
              loop
              style={{
                width: 16,
                height: 16,
              }}
            />
          </View>
        );
      }

      const renderHourglass = () => {
        if (confirmations > recommendedConfirmations) {
          return null;
        }

        return (
          <View style={{ justifyContent: 'center', marginRight: 2, width: 16 }}>
            <View style={{ width: 16, height: 16 }}>
              <LottieView
                ref={(c) => {
                  this.progressAnim = c;
                }}
                source={lottieFiles.hourglass}
                loop={false}
                progress={pendingProgress}
              />
            </View>
          </View>
        );
      };

      return (
        <Animated.View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            position: 'absolute',
            right: 46,
            opacity: confirmationOpacity,
          }}
        >
          {renderHourglass()}

          <Text
            style={[styles.smallText, confirmations ? styles.pendingText : styles.unconfirmedText]}
          >
            {`${confirmations}/${recommendedConfirmations}`}
          </Text>
        </Animated.View>
      );
    };

    const renderRow = (tx, address, balanceChanged, key) => {
      const renderBatchLine = () => {
        if (key) {
          return <View style={[styles.batchedLine]} />;
        }
        return null;
      };

      return (
        <View key={key}>
          {renderBatchLine()}
          <TouchableOpacity
            style={{ height: 56, marginVertical: 3 }}
            onPress={() => this._onPress({ tx, address, balanceChanged })}
            testID="transaction-item"
          >
            <View style={styles.itemContainer}>
              <View style={styles.infoContainer}>
                <View style={[styles.topContainer]}>
                  <Text
                    style={[
                      styles.amountText,
                      balanceChanged > 0 ? styles.positiveAmount : styles.negativeAmount,
                    ]}
                  >
                    {numFormat(balanceChanged, ticker)} {ticker}
                  </Text>
                  {renderCurrentState()}
                  <Text style={[styles.smallText]}>{this._getDateString()}</Text>
                </View>
                <Text style={[styles.smallText]} ellipsizeMode="middle" numberOfLines={1}>
                  {note || address}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    };

    return renderRow(tx, address, balanceChanged, key);
  }
}

TransactionListItem.contextTypes = {
  type: PropTypes.string,
  theme: PropTypes.string,
  coinid: PropTypes.shape({}),
};

class TransactionList extends PureComponent {
  constructor(props, context) {
    super(props);

    const { transactions } = props;
    const { coinid, theme } = context;
    const styles = themedStyleGenerator(theme);

    this.state = {
      listHeight: 0,
      graphHeight: 0,
      headerHeight: 0,
      isFiltersOpen: false,
      txItemsOffset: new Animated.Value(0),
      filterHeight: 0,
      styles,
    };

    this.filters = {
      text: '',
      type: 'all',
    };

    this.coinid = coinid;

    this.txData = [];
    this.transactions = transactions;
    this.filteredData = this.txData;
    this.dailySummary = {};
    this.sections = [{ data: [], title: 'Transactions' }];
    this.hasFiltered = false;

    this.noteHelper = coinid.noteHelper;
    this.noteHelper.on('savednote', this._onSavedNote);

    this.scrollCurrentY = 0;

    this._parseTransactionsProp(transactions);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLoadingTxs || !nextProps.transactions) {
      return;
    }

    if (
      this.transactions !== nextProps.transactions
      || this.props.languageTag !== nextProps.languageTag
    ) {
      this._parseTransactionsProp(nextProps.transactions);
    }
  }

  _buildTxData = () => {
    const txData = [];
    const addresses = this.coinid.getAllAddresses();

    let i = 0;

    let oldTx;
    const pushTxData = (tx, addr, balance) => {
      if (tx !== oldTx) {
        oldTx = tx;
        i = 0;
      }
      txData.push([tx, addr, balance, i++]);
    };

    this.transactions.forEach((tx) => {
      getTxBalanceChange(tx, addresses);

      // Sent
      if (tx.balanceChanged <= 0) {
        const { length } = txData;

        for (const addr in tx.summaryOther) {
          pushTxData(tx, addr, -tx.summaryOther[addr]);
        }

        // if no tx added, then it was most likely a transaction between internal addresses
        if (txData.length === length) {
          pushTxData(tx, '(internal transaction)', 0);
        }
      } else {
        // Received
        for (const addr in tx.summaryOwn) {
          pushTxData(tx, addr, tx.summaryOwn[addr]);
        }
      }
    });

    return txData;
  };

  _parseTransactionsProp = (transactions) => {
    this.transactions = transactions;
    this.txData = this._buildTxData();
    this._filterTransactions();
  };

  _onSavedNote = (tx, address) => {
    const itemKey = tx.txid + address + this.noteHelper.getBaseKey();
    if (activeItems[itemKey] !== undefined) {
      activeItems[itemKey]._loadNote();
    }
  };

  _filterRow = (data) => {
    const [tx, address, balanceChanged] = data;

    if (this.filters.type === 'received' && balanceChanged <= 0) {
      return false;
    }

    if (this.filters.type === 'sent' && balanceChanged > 0) {
      return false;
    }

    if (this.filters.regex) {
      if (!this.filters.regex.test(tx.txid) && !this.filters.regex.test(address)) {
        const note = this.noteHelper.getCachedNote(tx, address);
        if (!this.filters.regex.test(note)) {
          return false;
        }
      }
    }

    return true;
  };

  _createDailySummary = () => {
    this.dailySummary = {};
    const { moment } = this.props;

    const getDateString = (time) => {
      if (time) {
        return moment.unix(time).format('LL');
      }

      return moment().format('LL');
    };

    if (this.filteredData.length) {
      let prevTx = null;
      let accFee = Big(0);
      let prevDate = '';
      let i = this.filteredData.length - 1;

      for (; i >= 0; i--) {
        const [tx, , balanceChanged] = this.filteredData[i];
        const { time } = tx;

        if (prevTx !== tx) {
          if (prevTx !== null) {
            const date = getDateString(time);

            if (date !== prevDate) {
              this.dailySummary[i + 1] = {
                accFee: Number(accFee),
                date: prevDate,
              };
              accFee = Big(0);
            }
          }

          if (balanceChanged <= 0) {
            accFee = accFee.plus(tx.fees);
          }

          prevTx = tx;
          prevDate = getDateString(time);
        }
      }

      this.dailySummary[i + 1] = {
        accFee: Number(accFee),
        date: prevDate,
      };
    }
  };

  _filterTransactions = () => {
    this.filteredData = this.txData.filter(data => this._filterRow(data));

    let prevHash;
    this.filteredData = this.filteredData.map(([tx, address, balanceChanged, key]) => {
      if (tx.uniqueHash !== prevHash) {
        key = 0;
        prevHash = tx.uniqueHash;
      }

      return [tx, address, balanceChanged, key];
    });

    this._createDailySummary();

    this.hasFiltered = true;
    this.sections[0].data = this.filteredData;
  };

  _onPressItem = (info) => {
    const { showTransactionDetails } = this.props;
    showTransactionDetails(info);
  };

  _toggleFilters = () => {
    const { isFiltersOpen } = this.state;
    this.setState({ isFiltersOpen: !isFiltersOpen });
  };

  _filtersChanged = (filters) => {
    this.filters = filters;
    if (filters.text) {
      this.filters.regex = new RegExp(filters.text, 'i');
    } else {
      this.filters.regex = undefined;
    }

    if (this.filterTimeout) clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this._filterTransactions();
      this.forceUpdate();
    }, 0);
  };

  _isScrollWithinArea = (direction) => {
    const { graphHeight } = this.state;

    if (!direction) {
      return this.scrollCurrentY > 0 && this.scrollCurrentY < graphHeight - 2;
    }
    if (direction === -1) {
      return this.scrollCurrentY > 0;
    }
    if (direction === 1) {
      return this.scrollCurrentY < graphHeight - 2;
    }

    return false;
  };

  _scrollToFirst = () => {
    const { headerHeight } = this.state;
    this.sectionRef.scrollToLocation({
      itemIndex: Platform.OS === 'ios' ? 0 : 1,
      sectionIndex: 0,
      viewOffset: headerHeight,
    });
  };

  _scrollToTop = () => {
    const { headerHeight, graphHeight } = this.state;

    this.sectionRef.scrollToLocation({
      itemIndex: Platform.OS === 'ios' ? 0 : 1,
      sectionIndex: 0,
      viewOffset: graphHeight + headerHeight,
    });
  };

  _scrollToFirstTimeout = (direction) => {
    this._clearScrollToFirstTimeout();

    if (this._isScrollWithinArea(direction)) {
      direction = direction || 0;

      if (!direction) {
        if (this.scrollBeginY < this.scrollEndY) direction = 1;
        if (this.scrollBeginY > this.scrollEndY) direction = -1;
        if (direction === 0) {
          direction = this.lastDirection;
        }
      }

      this.lastDirection = direction;

      if (direction === 1) {
        this.scrollTime = setTimeout(() => {
          this._scrollToFirst();
        }, 0);
      }

      if (direction === -1) {
        this.scrollTime = setTimeout(() => {
          this._scrollToTop();
        }, 0);
      }
    }
  };

  _onMomentumScrollBegin = () => {
    this.momentumStarted = true;
    this._clearScrollToFirstTimeout();
  };

  _onMomentumScrollEnd = () => {
    if (this.momentumStarted) {
      this.momentumStarted = false;
      this._scrollToFirstTimeout();
    }
  };

  _onScrollBeginDrag = ({
    nativeEvent: {
      contentOffset: { y },
    },
  }) => {
    this.scrollBeginY = y;
    this._clearScrollToFirstTimeout();
  };

  _onScrollEndDrag = (e) => {
    this.scrollEndY = e.nativeEvent.contentOffset.y;
    this._scrollToFirstTimeout();
    this.momentumStarted = true;
  };

  _handleScroll = (e) => {
    this.scrollCurrentY = e.nativeEvent.contentOffset.y;
  };

  _clearScrollToFirstTimeout = () => {
    clearTimeout(this.scrollTime);
  };

  _renderItemWrapper = (props) => {
    const { txItemsOffset, filterHeight } = this.state;

    if (props.cellKey === '0:header') {
      return <Animated.View {...props}>{props.children}</Animated.View>;
    }

    if (props.prevCellKey === '0:header') {
      return (
        <Animated.View
          {...props}
          style={{
            transform: [{ translateY: txItemsOffset }],
            zIndex: 5,
            marginTop: -filterHeight,
          }}
        >
          {props.children}
        </Animated.View>
      );
    }

    return (
      <Animated.View {...props} style={{ transform: [{ translateY: txItemsOffset }], zIndex: 5 }}>
        {props.children}
      </Animated.View>
    );
  };

  _renderListFooter = () => {
    const { isLoadingTxs } = this.props;
    const { type } = this.context;
    const hasFilters = this.filters.type !== 'all' || this.filters.text;
    const txItemsCount = this.filteredData.length;

    const dailiesCount = Object.keys(this.dailySummary).length;
    const { filterHeight, listHeight, txItemsOffset } = this.state;
    const maxScroll = listHeight - 56;

    const itemsHeight = txItemsCount * (56 + 6) + dailiesCount * 36;

    if (itemsHeight >= maxScroll - filterHeight) {
      return <View style={{ height: filterHeight }} />;
    }

    const txListHeight = maxScroll - itemsHeight;

    if (txItemsCount) {
      return (
        <Animated.View
          style={{
            height: txListHeight,
            transform: [{ translateY: txItemsOffset }],
          }}
        />
      );
    }

    if (isLoadingTxs || !this.hasFiltered) {
      return (
        <Animated.View
          style={{
            height: txListHeight,
            justifyContent: 'flex-start',
            transform: [{ translateY: txItemsOffset }],
          }}
        >
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator animating size="large" style={{ marginTop: 30 }} />
            <Text style={{ fontSize: 18, marginTop: 8 }}>Loading transactions</Text>
            <Text style={{ marginTop: 8 }}>Your wallet will be ready soon</Text>
          </View>
        </Animated.View>
      );
    }

    if (hasFilters) {
      return (
        <Animated.View
          style={{
            height: txListHeight,
            justifyContent: 'flex-start',
            transform: [{ translateY: txItemsOffset }],
          }}
        >
          <View
            style={{
              marginTop: 40,
              marginBottom: 18,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>Filter did not match any transactions</Text>
            <Text
              style={{
                fontSize: 16,
                color: '#8A8A8F',
                marginTop: 8,
                ...fontWeight.normal,
              }}
            >
              Try another input
            </Text>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={{
          height: txListHeight,
          alignItems: 'center',
          justifyContent: 'flex-start',
          transform: [{ translateY: txItemsOffset }],
        }}
      >
        <View
          style={{
            width: 120,
            height: 120,
            marginTop: 40,
            marginBottom: 18,
          }}
        >
          <LottieView source={lottieFiles[`emptytrans_${type}`]} autoSize />
        </View>
        <Text style={{ fontSize: 18 }}>No transactions</Text>
        <Text
          style={{
            fontSize: 16,
            color: '#8A8A8F',
            marginTop: 8,
            ...fontWeight.normal,
          }}
        >
          Your transactions will be listed here
        </Text>
      </Animated.View>
    );
  };

  _renderItem = ({ item, index }) => {
    const { isLoadingTxs, languageTag, moment } = this.props;

    const {
      coinid: { ticker },
    } = this.context;

    if (isLoadingTxs) {
      return null;
    }

    const txItem = (
      <TransactionListItem
        key="item"
        txData={item}
        confirmations={item[0].confirmations}
        onPressItem={this._onPressItem}
        languageTag={languageTag}
        moment={moment}
      />
    );

    const doRenderItem = () => {
      const { styles } = this.state;

      if (this.dailySummary[index] !== undefined) {
        const { accFee, date } = this.dailySummary[index];
        const dayItem = (
          <View key="fee" style={styles.dailySummary}>
            <Text style={styles.dailySummaryDate}>{date}</Text>
            <TranslatedText
              style={styles.paidFees}
              options={{
                fees: `${numFormat(accFee, ticker)} ${ticker}`,
              }}
            >
              transactionlist.paidfees
            </TranslatedText>
          </View>
        );

        return [dayItem, txItem];
      }
      return [txItem];
    };

    return doRenderItem();
  };

  _renderSectionHeader = ({ section }) => {
    const {
      filterHeight, txItemsOffset, isFiltersOpen, styles,
    } = this.state;
    const hasFilters = this.filters.type !== 'all' || this.filters.text;

    const showFilterIndicator = () => {
      if (hasFilters) {
        return <View style={styles.filterIndicator} />;
      }

      return null;
    };

    if (section.title === 'Transactions') {
      return (
        // setState below... might want to change that...
        <View
          onLayout={({
            nativeEvent: {
              layout: { height: layoutHeight },
            },
          }) => {
            /* this.setState({
              headerHeight: 0,
            }); */
          }}
          style={[styles.listHeader, { paddingBottom: filterHeight }]}
        >
          <View style={styles.listHeaderTop}>
            <TranslatedText style={styles.subHeader}>transactions</TranslatedText>
            <Icon
              iconStyle={styles.subLink}
              size={24}
              name="filter-list"
              onPress={this._toggleFilters}
              underlayColor={colors.transparent}
              hitSlop={{
                top: 20,
                bottom: 20,
                left: 20,
                right: 20,
              }}
              testID="button-filter-list"
            />
            {showFilterIndicator()}
          </View>
          <TransactionFilter
            txItemsOffset={txItemsOffset}
            isOpen={isFiltersOpen}
            onFilterChange={this._filtersChanged}
            onFocus={() => this._scrollToFirstTimeout(1)}
            changedHeight={height => this.setState({ filterHeight: height })}
          />
        </View>
      );
    }
    return null;
  };

  render() {
    const { toggleRange, languageTag } = this.props;
    const { styles } = this.state;

    return (
      <SectionList
        onScroll={this._handleScroll}
        style={[styles.container]}
        CellRendererComponent={this._renderItemWrapper}
        initialNumToRender={10}
        ref={(c) => {
          this.sectionRef = c;
        }}
        onMomentumScrollBegin={this._onMomentumScrollBegin}
        onMomentumScrollEnd={this._onMomentumScrollEnd}
        onScrollBeginDrag={this._onScrollBeginDrag}
        onScrollEndDrag={this._onScrollEndDrag}
        onLayout={({
          nativeEvent: {
            layout: { height: listHeight },
          },
        }) => {
          this.setState({ listHeight });
        }}
        ListHeaderComponent={(
          <View
            onLayout={({
              nativeEvent: {
                layout: { height: graphHeight },
              },
            }) => {
              this.setState({ graphHeight });
            }}
          >
            <Graph toggleRange={toggleRange} />
          </View>
)}
        ListFooterComponent={this._renderListFooter}
        renderItem={this._renderItem}
        renderSectionHeader={this._renderSectionHeader}
        keyExtractor={item => item[0].txid + item[1]}
        stickySectionHeadersEnabled
        sections={this.sections}
      />
    );
  }
}

TransactionList.contextTypes = {
  coinid: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
};

TransactionList.propTypes = {
  transactions: PropTypes.array,
  blockHeight: PropTypes.number,
};

TransactionList.defaultProps = {
  transactions: [],
  blockHeight: 0,
};

export default withLocaleContext(TransactionList);
