// @flow
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import Settings from './containers/Settings';
import EnvironmentDetails from './containers/EnvironmentDetails';
import ClusterDetails from './containers/ClusterDetails';
import TierDetails from './containers/TierDetails';
import NavigationComponent from './containers/NavigationComponent';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="settings" component={Settings} />
    <Route path="/" component={NavigationComponent} >
      <Route path="clusters/:clusterId" component={ClusterDetails} />
      <Route path="clusters/:clusterId/:tierName" component={TierDetails} />
      <Route path="clusters/:clusterId/:tierName/:environmentId" component={EnvironmentDetails} />
    </Route>
  </Route>
);
