import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FlatList, View, Alert } from 'react-native';
import Big from 'big.js';
import {
  Button,
  CancelButton,
  RowInfo,
  DetailsModal,
  Text,
  COINiDTransport,
  FeeSlider,
  ExpandableView,
  FontScale,
} from '../../components';
import styles from './styles';
import { numFormat } from '../../utils/numFormat';
import ExchangeHelper from '../../utils/exchangeHelper';
import SettingHelper from '../../utils/settingHelper';
import { getByteCount } from '../../libs/coinid-public/utils';
import { fontSize, gridMultiplier } from '../../config/styling';

export default class SweepKeyDetails extends PureComponent {
  constructor(props, context) {
    super(props);

    const {
      coinid: { ticker },
    } = context;

    this.settingHelper = SettingHelper(ticker);
    this.exchangeHelper = ExchangeHelper(ticker);

    this.state = {
      inputAddressInfo: [],
      groupBalance: {},
      balance: 0,
      ticker,
      exchangeRate: 0,
      currency: '',
      fee: 0,
      isLoadingHistory: true,
    };
  }

  getChildContext() {
    const { theme: propsTheme } = this.props;
    const { theme: contextTheme } = this.context;

    return {
      theme: propsTheme || contextTheme,
    };
  }

  componentDidMount() {
    this._onSettingsUpdated(this.settingHelper.getAll());
    this.settingHelper.on('updated', this._onSettingsUpdated);
  }

  componentWillUnmount() {
    this.settingHelper.removeListener('updated', this._onSettingsUpdated);
    clearTimeout(this.queuedFetch);
  }

  _onSettingsUpdated = (settings) => {
    const { currency } = settings;
    this.setState({ currency });
    this._refreshExchangeRate(currency);
  };

  _refreshExchangeRate = (currency) => {
    this.exchangeHelper.convert(1, currency).then((exchangeRate) => {
      this.setState({ exchangeRate });
    });
  };

  _open = (inputAddressInfo) => {
    this.setState(
      {
        groupBalance: {},
        balance: 0,
        fee: 0,
        isLoadingHistory: true,
        inputAddressInfo,
      },
      () => {
        this._fetchUnspentInputs(false);
      },
    );

    this.refModal._open();
  };

  _getTransportData = () => {
    const { coinid } = this.context;
    const { fee } = this.state;
    const receiveAddress = coinid.getReceiveAddress();

    const feeSat = Number(Big(fee).times(1e8));
    const valData = coinid.buildSwpTxCoinIdData(receiveAddress, this.formattedInputArr, feeSat);

    return Promise.resolve(valData);
  };

  _handleReturnData = (data) => {
    const { coinid } = this.context;
    const [action, hex] = data.split('/');

    if (action === 'SWPTX' && hex) {
      coinid
        .queueTx(hex, undefined, undefined, this.formattedInputArr)
        .then((queueData) => {
          coinid.noteHelper.saveNote(
            queueData.tx,
            queueData.tx.vout[0].addr,
            'From sweeped private key',
          );

          this._close();
        })
        .catch((err) => {
          Alert.alert(`${err}`);
        });
    }
  };

  _fetchUnspentInputs = (silent) => {
    const { coinid } = this.context;
    const { inputAddressInfo } = this.state;

    const addresses = inputAddressInfo.map(e => e.address);

    clearTimeout(this.queuedFetch);

    if (!silent) {
      this.setState({ isLoadingHistory: true });
    }

    coinid
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

  _close = () => {
    this.refModal._close();
  };

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

    const { coinid } = this.context;

    const unCompressedInputs = formattedInputArr.filter(e => e.compressed === false);
    const uncompressed = !!unCompressedInputs.length;

    const inputsCounts = formattedInputArr.reduce(
      (a, { type }) => ({
        ...a,
        [type]: !a[type] ? 1 : a[type] + 1,
      }),
      {},
    );

    const addressType = coinid.getAccountAddressType();

    const outputCounts = {
      [addressType]: 1,
    };

    return getByteCount(inputsCounts, outputCounts, uncompressed);
  };

  _getExpandableMaxHeight = () => {
    const {
      modalHeight, containerHeight, innerExpandableHeight, expandableContentHeight,
    } = this;

    if (
      modalHeight === undefined
      || containerHeight === undefined
      || innerExpandableHeight === undefined
    ) {
      return 0;
    }

    const expandableMaxHeight = containerHeight - (modalHeight - innerExpandableHeight);

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

  _onModalLayout = ({ nativeEvent: { layout } }) => {
    const { height } = layout;
    this.modalHeight = height;
  };

  _onModalOuterLayout = ({ nativeEvent: { layout } }) => {
    const { height } = layout;
    this.containerHeight = height - 16;
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

  _onOpened = () => {
    const { onOpened } = this.props;
    onOpened();
  };

  _onClosed = () => {
    const { onClosed } = this.props;
    onClosed();
  };

  _renderTransportContent = ({
    isSigning, signingText, cancel, submit,
  }) => {
    const {
      balance, ticker, exchangeRate, currency, fee, isLoadingHistory,
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
    const fiatText = `${numFormat(Big(balance).times(exchangeRate), currency)} ${currency}`;

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
      <DetailsModal
        ref={(c) => {
          this.refModal = c;
        }}
        title="Private Key Details"
        onClosed={this._onClosed}
        onOpened={this._onOpened}
        onLayout={this._onModalLayout}
        onOuterLayout={this._onModalOuterLayout}
      >
        <COINiDTransport
          ref={(c) => {
            this.transportRef = c;
          }}
          getData={this._getTransportData}
          handleReturnData={this._handleReturnData}
        >
          {arg => this._renderTransportContent(arg)}
        </COINiDTransport>
      </DetailsModal>
    );
  }
}

SweepKeyDetails.contextTypes = {
  coinid: PropTypes.shape({}),
  type: PropTypes.string,
  theme: PropTypes.string,
};

SweepKeyDetails.childContextTypes = {
  theme: PropTypes.string,
};

SweepKeyDetails.propTypes = {
  theme: PropTypes.string,
};

SweepKeyDetails.defaultProps = {
  theme: 'light',
};
