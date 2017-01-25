// @flow
import React, { Component } from 'react';
import Dialogs from './Dialogs';

export default class App extends Component {
  props: {
    children: HTMLElement
  };

  render() {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {this.props.children}
        <Dialogs />
      </div>
    );
  }
}
