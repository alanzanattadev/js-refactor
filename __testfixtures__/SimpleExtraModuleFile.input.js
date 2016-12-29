'use babel'
// @flow

import React from 'react';
import { Provider } from 'react-redux';
import { StyleRoot } from 'radium';
import TrackingContext from 'veyo-commons/__testfixtures__/SimpleExtraModuleFile.input';
import store from 'veyo-commons/redux/store';
import { tracker } from "./Config";

export default class ContextProvider extends React.Component<DefaultProps, Props, State> {

  state: State;
  props: Props;
  static defaultProps: DefaultProps;

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <Provider store={store}>
        <TrackingContext tracker={tracker}>
          <StyleRoot radiumConfig={{userAgent: this.props.userAgent}}>
            {this.props.children}
          </StyleRoot>
        </TrackingContext>
      </Provider>
    )
  }
}

ContextProvider.propTypes = {

};

ContextProvider.defaultProps = {

};

type DefaultProps = {

};

type Props = {
  children: any,
  userAgent?: string,
};

type State = {

};
