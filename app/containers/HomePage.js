// @flow
import React, { Component } from 'react';
import Home from '../components/Home';
import Navigation from './Navigation';

export default class HomePage extends Component {
  render() {
    return (
      <Navigation router={this.props.router} />
    );
  }
}
