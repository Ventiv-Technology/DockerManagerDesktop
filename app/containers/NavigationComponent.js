// @flow
import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

import Navigation from './Navigation';


const NavigationComponent = (props) => (
  <div>
    <Navigation router={props.router} />
    <div style={{ paddingLeft: props.muiTheme.drawer.width + 16, paddingTop: 16, paddingRight: 16 }}>
      {props.children}
    </div>
  </div>
);

export default muiThemeable()(NavigationComponent);
