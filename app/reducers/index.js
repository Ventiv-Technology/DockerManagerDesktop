// @flow
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import settings from './settings';
import environment from './environment';
import serviceInstances from './serviceInstances';
import dialog from './dialog';

const rootReducer = combineReducers({
  routing,
  settings,
  environment,
  serviceInstances,
  dialog,
});

export default rootReducer;
