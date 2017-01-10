import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import theme from 'material-ui/styles/baseThemes/darkBaseTheme';
import theme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ElectronSettings from 'electron-settings';
import electron from 'electron';
import routes from './routes';
import configureStore from './store/configureStore';
import './app.global.css';

injectTapEventPlugin();

ElectronSettings.configure({ atomicSaving: true, prettify: true });

const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
      <Router history={history} routes={routes} />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root')
);

// Generic listener for messages from Main thread - to dispatch on redux store
electron.ipcRenderer.on('DISPATCH_REDUX_MESSAGE', (event, message) => {
  store.dispatch(message);
});
