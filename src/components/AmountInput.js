import React, { PureComponent } from 'react';
import { TextInput } from 'react-native';
import PropTypes from 'prop-types';
import Big from 'big.js';
import { isCryptoCurrency } from '../utils/numFormat';

class AmountInput extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      amount: '',
      fiatAmount: '',
    };
  }

  componentDidMount() {
    const { amount } = this.props;
    if (amount) {
      this._onChangeAmountText(`${amount}`);
    }
  }

  _updateAmount = (amount) => {
    this._onChangeAmountText(`${amount}`);
  };

  _isValidInput = (text, currency) => {
    if (isCryptoCurrency(currency)) {
      const regex = /^([0-9]\d*(\.\d{0,8})?)?$/;
      return regex.test(text);
    }

    const regex = /^([0-9]\d*(\.\d{0,2})?)?$/;
    return regex.test(text);
  };

  _onChangeAmountText = (inputAmount, skipFiatConversion) => {
    const {
      onChangeAmount, exchangeRate, exchangeTo, exchangeFrom,
    } = this.props;
    const amount = this._cleanAmount(inputAmount, exchangeFrom);

    if (amount === '') {
      this.setState({ amount: '', fiatAmount: '' });
      onChangeAmount('');
      return;
    }

    if (!this._isValidInput(amount, exchangeFrom)) {
      return;
    }

    onChangeAmount(amount);

    if (skipFiatConversion) {
      this.setState({ amount });
    } else if (!Number.isNaN(exchangeRate) && !Number.isNaN(amount)) {
      let fiatAmount = Number(Big(amount).times(exchangeRate));
      fiatAmount = this._convertNumberToFixed(fiatAmount, exchangeTo);

      this.setState({ amount, fiatAmount: this._cleanAmount(fiatAmount, exchangeTo) });
    }
  };

  _convertNumberToFixed = (fromNumber, currency) => {
    let amount = isCryptoCurrency(currency) ? fromNumber.toFixed(8) : fromNumber.toFixed(2);
    amount = amount.replace(/0*$/, '');
    amount = amount.replace(/\.$/, '');

    return amount;
  };

  _onChangeFiatText = (inputFiat) => {
    const {
      exchangeRate, exchangeTo, exchangeFrom, onChangeAmount,
    } = this.props;
    const fiatAmount = this._cleanAmount(inputFiat, exchangeTo);

    if (fiatAmount === '') {
      this.setState({ amount: '', fiatAmount: '' });
      onChangeAmount('');
      return;
    }

    if (!this._isValidInput(fiatAmount, exchangeTo)) {
      return;
    }

    this.setState({ fiatAmount });

    let amount = Big(fiatAmount);
    if (exchangeRate) {
      amount = amount.div(exchangeRate);
    } else {
      amount = 0;
    }

    amount = Number(amount);
    amount = this._convertNumberToFixed(amount, exchangeFrom);

    this._onChangeAmountText(`${amount}`, true);
  };

  _onSubmitEditing = () => {
    const { onSubmitEditing } = this.props;

    onSubmitEditing();
  };

  _getAmountMaxLength = (amount) => {
    const maxLength1 = `${amount}`.replace(/\.[0-9]*$/, '').length + 8 + 1;
    const maxLength2 = `${amount}`.length + 1;

    return maxLength1 < maxLength2 ? maxLength1 : maxLength2;
  };

  _cleanAmount = (input, currency) => {
    if (isCryptoCurrency(currency)) {
      return `${input}`
        .replace(',', '.')
        .replace(/^\./, '0.')
        .replace(/^[0]{2,}/, '0')
        .replace(/([.]\d{8,8})(.*$)/, '$1');
    }

    return `${input}`
      .replace(',', '.')
      .replace(/^\./, '0.')
      .replace(/^[0]{2,}/, '0')
      .replace(/([.]\d{2,2})(.*$)/, '$1');
  };

  focus() {
    const { inputInFiat } = this.props;

    if (inputInFiat) {
      this.fiatRef.focus();
    } else {
      this.amountRef.focus();
    }
  }

  render() {
    const { style, inputInFiat } = this.props;
    const { amount, fiatAmount } = this.state;

    if (inputInFiat) {
      return (
        <TextInput
          ref={(c) => {
            this.fiatRef = c;
          }}
          style={style}
          value={`${fiatAmount}`}
          maxLength={this._getAmountMaxLength(fiatAmount)}
          onChangeText={this._onChangeFiatText}
          onSubmitEditing={this._onSubmitEditing}
          keyboardType="numeric"
          returnKeyType="done"
          textContentType="none"
          underlineColorAndroid="transparent"
          autoCapitalize="words"
        />
      );
    }

    return (
      <TextInput
        ref={(c) => {
          this.amountRef = c;
        }}
        style={style}
        value={`${amount}`}
        onChangeText={this._onChangeAmountText}
        maxLength={this._getAmountMaxLength(amount)}
        onSubmitEditing={this._onSubmitEditing}
        keyboardType="decimal-pad"
        returnKeyType="done"
        textContentType="none"
        underlineColorAndroid="transparent"
        autoCapitalize="words"
      />
    );
  }
}

AmountInput.propTypes = {
  exchangeRate: PropTypes.number,
  onSubmitEditing: PropTypes.func,
};

AmountInput.defaultProps = {
  exchangeRate: 1.0,
  onSubmitEditing: () => {},
};

export default AmountInput;
