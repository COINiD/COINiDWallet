import 'react-native';
import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import PropTypes from 'prop-types';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });
import Receive from '../Receive';

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

describe('Receive', () => {
  const defaultProps = {
    address: "msvEw9nCEtDtayUe9Mthh657yaDaqNN5A7",
  };

  const getWrapper = (props=defaultProps) => {
    const wrapper = shallow(
      <Receive {...props} />,
      { context },
    );

    const instance = wrapper.instance();
    instance.amountRef = { _updateAmount: jest.fn() };

    return { wrapper, instance };
  }

  it('gets matches snapshot', () => {
    const { wrapper, instance } = getWrapper();
    expect(wrapper.state()).toMatchSnapshot();
  });

});
