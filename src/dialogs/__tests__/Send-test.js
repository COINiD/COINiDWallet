import 'react-native';
import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import PropTypes from 'prop-types';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });
import Send from '../Send';

import COINiDPublic from '../../libs/coinid-public';
import settings from '../../config/settings';
import storageHelper from '../../utils/storageHelper';
import settingHelper from '../../utils/settingHelper';

const context = {
  coinid: COINiDPublic(
    settings.coin,
    storageHelper(`${settings.coin}-hot`),
    `${settings.coin}-hot`,
  ),
  settingHelper: settingHelper(settings.coin),
}

describe('decodeQrRequest', () => {

  const getWrapper = (props={balance:10}) => {
    const wrapper = shallow(
      <Send {...props} />,
      { context },
    );

    const instance = wrapper.instance();
    instance.amountRef = { _updateAmount: jest.fn() };

    return { wrapper, instance };
  }

  it('parses a qr code result', () => {
    const { wrapper, instance } = getWrapper();

    const isParsed = instance._parseQRCodeResult('bitcoin:mhNR7zLchYfX5GtFZ1opW8FeAG63wVjP9D?amount=10&message=Hello');
    expect(isParsed).toEqual(true);

    expect(wrapper.state()).toMatchSnapshot();

    expect(instance._verify).not.toThrow();
    wrapper.setState({ amount: "0", address: "mhNR7zLchYfX5GtFZ1opW8FeAG63wVjP9D" });
    expect(instance._verify).toThrow();
    wrapper.setState({ amount: "10", address: "123" });
    expect(instance._verify).toThrow();
    wrapper.setState({ amount: "10", address: "mhNR7zLchYfX5GtFZ1opW8FeAG63wVjP9D" });
    expect(instance._verify).not.toThrow();
    wrapper.setState({ amount: "100", address: "mhNR7zLchYfX5GtFZ1opW8FeAG63wVjP9D" });
    expect(instance._verify).not.toThrow();
  });

  it('not parse qr result', () => {
    const { wrapper, instance } = getWrapper();

    const isParsed = instance._parseQRCodeResult('wierdstring');
    expect(isParsed).toEqual(false);

    expect(wrapper.state()).toMatchSnapshot();
    expect(instance._verify).toThrow();
  });
});
