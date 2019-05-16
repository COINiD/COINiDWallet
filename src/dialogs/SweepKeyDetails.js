import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, FlatList, View, Alert,
} from 'react-native';
import Big from 'big.js';
import {
  Button,
  CancelButton,
  RowInfo,
  Text,
  COINiDTransport,
  FeeSlider,
  ExpandableView,
  FontScale,
} from '../components';
import ConvertCurrency from '../components/ConvertCurrency';

import { numFormat } from '../utils/numFormat';
import { getByteCount } from '../libs/coinid-public/utils';
import {
  colors, fontWeight, fontSize, gridMultiplier,
} from '../config/styling';

import styleMerge from '../utils/styleMerge';
import parentStyles from './styles/common';

import WalletContext from '../contexts/WalletContext';

const styles = styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    secondTitle: {
      textAlign: 'center',
      fontSize: fontSize.h3,
      lineHeight: fontSize.h3 * 1.2,
      marginBottom: gridMultiplier * 2,
      ...fontWeight.medium,
    },
    balance: {
      marginBottom: gridMultiplier * 1,
      textAlign: 'center',
      color: colors.purple,
      fontSize: fontSize.large,
      lineHeight: fontSize.large * 1.2,
      ...fontWeight.bold,
    },
    fiatBalance: {
      marginBottom: gridMultiplier * 2 - 2,
      textAlign: 'center',
      color: colors.gray,
      fontSize: fontSize.h2,
      lineHeight: fontSize.large * 1.2,
      ...fontWeight.normal,
    },
    detailItem: {
      paddingVertical: gridMultiplier * 1,
      paddingHorizontal: gridMultiplier * 2,
    },
    detailItemFirst: {
      paddingTop: gridMultiplier * 1,
    },
    detailItemBalance: {
      fontSize: fontSize.base,
      lineHeight: fontSize.base * 1.2,
      ...fontWeight.medium,
      marginBottom: gridMultiplier * 1 - 2,
    },
    feeWrapper: {
      marginBottom: gridMultiplier * 2,
    },
    totalWrapper: {
      marginBottom: gridMultiplier * 3,
    },
    detailItemAddress: {
      fontSize: fontSize.small,
      lineHeight: fontSize.small * 1.2,
    },
    addressContainerWrapper: {
      marginHorizontal: -gridMultiplier * 2,
      marginTop: gridMultiplier * 1,
    },
    addressContainer: {},
    addressContainerContent: {
      marginTop: -gridMultiplier * 1,
      marginBottom: gridMultiplier * 1,
    },
    horizontalBorder: {
      height: 1,
      marginBottom: gridMultiplier * 3,
      paddingHorizontal: gridMultiplier * 2,
      marginHorizontal: -gridMultiplier * 2,
      backgroundColor: colors.lightGray,
    },
  }),
);

export default class SweepKeyDetails extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    dialogRef: PropTypes.shape({}).isRequired,
    inputAddressInfo: PropTypes.shape([]).isRequired,
    dialogInnerHeight: PropTypes.number.isRequired,
    dialogHeight: PropTypes.number.isRequired,
  };

  constructor(props, context) {
    super(props);

    const { coinid } = context;

    this.coinid = coinid;
    const { ticker } = this.coinid;

    const { inputAddressInfo } = this.props;

    this.state = {
      inputAddressInfo,
      groupBalance: {},
      balance: 0,
      ticker,
      fee: 0,
      isLoadingHistory: true,
    };
  }

  componentDidMount() {
    this._fetchUnspentInputs(false);
  }

  componentWillUnmount() {
    clearTimeout(this.queuedFetch);
  }

  _getTransportData = () => {
    const { fee } = this.state;
    const receiveAddress = this.coinid.getReceiveAddress();

    const feeSat = Number(Big(fee).times(1e8));
    const valData = this.coinid.buildSwpTxCoinIdData(
      receiveAddress,
      this.formattedInputArr,
      feeSat,
    );

    return Promise.resolve(valData);
  };

  _handleReturnData = (data) => {
    const [action, hex] = data.split('/');
    const { dialogCloseAndClear } = this.context;

    if (action === 'SWPTX' && hex) {
      this.coinid
        .queueTx(hex, undefined, undefined, this.formattedInputArr)
        .then((queueData) => {
          this.coinid.noteHelper.saveNote(
            queueData.tx,
            queueData.tx.vout[0].addr,
            'From sweeped private key',
          );

          dialogCloseAndClear(true);
        })
        .catch((err) => {
          Alert.alert(`${err}`);
        });
    }
  };

  _fetchUnspentInputs = (silent) => {
    const { inputAddressInfo } = this.state;

    const addresses = inputAddressInfo.map(e => e.address);

    clearTimeout(this.queuedFetch);

    if (!silent) {
      this.setState({ isLoadingHistory: true });
    }

    this.coinid
      .fetchUnspent(addresses)
      .then((unspentTxs) => {
        const formattedInputArr = this._getFormattedInputArray(unspentTxs, inputAddressInfo);

        const balanceSat = formattedInputArr.reduce((a, { valueSat }) => a.plus(valueSat), Big(0));
        const balance = balanceSat.div(1e8);

        const zeroBalances = addresses.reduce(
          (a, address) => ({
            ...a,
            [address]: Big(0),
          }),
          {},
        );

        const groupBalance = formattedInputArr.reduce(
          (a, { address, valueSat }) => ({
            ...a,
            [address]: a[address].plus(valueSat),
          }),
          zeroBalances,
        );

        this.formattedInputArr = formattedInputArr;

        this.setState({
          groupBalance,
          balance,
          isLoadingHistory: false,
        });

        this.queuedFetch = setTimeout(() => this._fetchUnspentInputs(true), 20000);
      })
      .catch(() => {
        this.queuedFetch = setTimeout(() => this._fetchUnspentInputs(true), 2000);
      });
  };

  _getFormattedInputArray = (unspentTxs, addressesInfo) => unspentTxs.map((input) => {
    const [{ type, compressed }] = addressesInfo.filter(e => e.address === input.address);

    const {
      address, hash, index, valueSat,
    } = input;

    return {
      type,
      address,
      hash,
      index,
      valueSat,
      compressed,
    };
  });

  _renderAddresses = () => {
    const { inputAddressInfo, groupBalance } = this.state;

    if (inputAddressInfo.length === 0) {
      return null;
    }

    const doPrintAddresses = () => inputAddressInfo.map(e => (
      <Text key={`${e.address}`} style={{ marginBottom: 8, fontSize: 10 }} selectable>
        {`${e.address}`}
        {groupBalance[e.address] ? ` ${groupBalance[e.address] / 1e8}` : ''}
      </Text>
    ));

    return <View>{doPrintAddresses()}</View>;
  };

  _setFee = (fee) => {
    this.setState({ fee });
  };

  _estimateSize = (balance, formattedInputArr = []) => {
    if (formattedInputArr.length === 0 || Number(balance) <= 0) {
      return 0;
    }

    const unCompressedInputs = formattedInputArr.filter(e => e.compressed === false);
    const uncompressed = !!unCompressedInputs.length;

    const inputsCounts = formattedInputArr.reduce(
      (a, { type }) => ({
        ...a,
        [type]: !a[type] ? 1 : a[type] + 1,
      }),
      {},
    );

    const addressType = this.coinid.getAccountAddressType();

    const outputCounts = {
      [addressType]: 1,
    };

    return getByteCount(inputsCounts, outputCounts, uncompressed);
  };

  _getExpandableMaxHeight = () => {
    const { innerExpandableHeight, expandableContentHeight } = this;
    const { dialogInnerHeight, dialogHeight } = this.props;

    if (
      dialogInnerHeight === undefined
      || dialogHeight === undefined
      || innerExpandableHeight === undefined
    ) {
      return 0;
    }

    const expandableMaxHeight = dialogHeight - (dialogInnerHeight - innerExpandableHeight);

    if (expandableContentHeight < expandableMaxHeight) {
      return expandableContentHeight;
    }

    return expandableMaxHeight;
  };

  _getAddressSummary = () => {
    const { inputAddressInfo, groupBalance } = this.state;

    return inputAddressInfo.map(({ address }) => ({
      address,
      balanceSat: groupBalance[address] ? groupBalance[address] : 0,
    }));
  };

  _onExpandableScrollViewLayout = ({ nativeEvent: { layout } }) => {
    const { height } = layout;
    this.innerExpandableHeight = height;
  };

  _onExpandableContentSizeChange = (w, h) => {
    this.expandableContentHeight = h;
  };

  _renderDetailListItem = ({ item, index }, size) => {
    const { ticker } = this.state;

    return (
      <View
        style={[
          styles.detailItem,
          index === 0 ? styles.detailItemFirst : null,
          index === size - 1 ? styles.detailItemLast : null,
        ]}
      >
        <Text style={styles.detailItemBalance}>
          {`${numFormat(item.balanceSat / 1e8, ticker)} ${ticker}`}
        </Text>
        <FontScale
          fontSizeMax={fontSize.small}
          fontSizeMin={fontSize.small / 2}
          lineHeightMax={fontSize.small * 1.2}
          text={item.address}
          widthScale={0.95}
        >
          {({ fontSize: variableFontSize, lineHeight }) => (
            <Text
              style={[styles.detailItemAddress, { fontSize: variableFontSize, lineHeight }]}
              ellipsizeMode="middle"
              numberOfLines={1}
              selectable
            >
              {item.address}
            </Text>
          )}
        </FontScale>
      </View>
    );
  };

  _renderExpandableContent = () => {
    const { isLoadingHistory } = this.state;

    const data = this._getAddressSummary();

    return (
      <FlatList
        onRefresh={() => this._fetchUnspentInputs(false)}
        refreshing={isLoadingHistory}
        data={data}
        renderItem={args => this._renderDetailListItem(args, data.length)}
        style={[styles.addressContainer]}
        contentContainerStyle={styles.addressContainerContent}
        onContentSizeChange={this._onExpandableContentSizeChange}
        onLayout={this._onExpandableScrollViewLayout}
        keyExtractor={item => item.address}
      />
    );
  };

  _renderTransportContent = ({
    isSigning, signingText, cancel, submit,
  }) => {
    const {
      balance, ticker, fee, isLoadingHistory,
    } = this.state;

    const total = Big(balance).minus(fee);

    let disableButton = false;
    let loadingText = '';
    let isLoading = false;
    let buttonText = 'Transfer to Wallet';

    if (isLoadingHistory) {
      disableButton = true;
      isLoading = true;
      loadingText = 'Loading History';
    }

    if (isSigning) {
      disableButton = true;
      isLoading = true;
      loadingText = signingText;
    }

    if (Number(total) <= 0) {
      disableButton = true;
      buttonText = 'Nothing to Sweep';
    }

    const balanceText = `${numFormat(balance, ticker)} ${ticker}`;

    return (
      <View style={styles.modalContent}>
        <FontScale
          fontSizeMax={fontSize.large}
          fontSizeMin={fontSize.large / 4}
          lineHeightMax={fontSize.large * 1.2}
          text={balanceText}
          widthScale={0.9}
        >
          {({ fontSize: variableFontSize, lineHeight }) => (
            <Text style={[styles.balance, { fontSize: variableFontSize, lineHeight }]}>
              {balanceText}
            </Text>
          )}
        </FontScale>
        <ConvertCurrency value={balance}>
          {({ fiatText }) => (
            <FontScale
              fontSizeMax={fontSize.h2}
              fontSizeMin={fontSize.h2 / 4}
              lineHeightMax={fontSize.h2 * 1.2}
              text={fiatText}
              widthScale={0.6}
            >
              {({ fontSize: variableFontSize, lineHeight }) => (
                <Text style={[styles.fiatBalance, { fontSize: variableFontSize, lineHeight }]}>
                  {fiatText}
                </Text>
              )}
            </FontScale>
          )}
        </ConvertCurrency>

        <ExpandableView
          initialIsExpanded={false}
          contractedTitle="More details"
          expandedTitle="Hide details"
          getMaxHeight={this._getExpandableMaxHeight}
          style={styles.addressContainerWrapper}
        >
          {this._renderExpandableContent()}
        </ExpandableView>
        <View style={styles.horizontalBorder} />
        <Text style={styles.secondTitle}>Send balance to your wallet</Text>
        <View style={styles.feeWrapper}>
          <FeeSlider
            extraData={this.formattedInputArr}
            onChange={(val) => {
              this._setFee(val);
            }}
            amount={balance}
            batchedTransactions={[]}
            customEstimateSizeFn={() => this._estimateSize(balance, this.formattedInputArr)}
            disabled={isSigning}
          />
        </View>
        <RowInfo style={styles.totalWrapper} title="Total">
          {`${numFormat(total, ticker)} ${ticker}`}
        </RowInfo>
        <Button
          onPress={submit}
          disabled={disableButton}
          isLoading={isLoading}
          loadingText={loadingText}
        >
          {buttonText}
        </Button>
        <CancelButton show={isSigning} onPress={cancel} marginTop={gridMultiplier * 2}>
          Cancel
        </CancelButton>
      </View>
    );
  };

  render() {
    return (
      <COINiDTransport
        ref={(c) => {
          this.transportRef = c;
        }}
        getData={this._getTransportData}
        handleReturnData={this._handleReturnData}
        parentDialog="SweepKeyDetails"
      >
        {arg => this._renderTransportContent(arg)}
      </COINiDTransport>
    );
  }
}
