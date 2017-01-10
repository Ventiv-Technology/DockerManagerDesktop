// @flow
import _ from 'lodash';
import uuid from 'uuid';
import ElectronSettings from 'electron-settings';
import { ADD_SERVER, UPDATE_SERVER_SETTINGS, DELETE_SERVER_SETTINGS, SERVER_SETTINGS_CHANGED } from '../actions/settings';

const initialState = ElectronSettings.getSync('servers') || [];

export default function settings(state = initialState, action: Object) {
  switch (action.type) {
    case ADD_SERVER:
      return [
        ...state,
        { id: uuid.v4(), name: '', url: '', selected: state.length === 0 }
      ];
    case UPDATE_SERVER_SETTINGS: {
      const newServer = Object.assign({}, action.server, { [action.path]: action.value });
      return state.map((server) => {
        if (action.path === 'selected' && server.id !== action.server.id) {
          return { ...server, selected: false };
        } else if (server.id !== action.server.id) {
          return server;
        }

        return Object.assign({}, server, newServer);
      });
    }
    case DELETE_SERVER_SETTINGS:
      return state.filter(server => server.id !== action.server.id);
    case SERVER_SETTINGS_CHANGED:
      return action.newValue.slice(0);
    default:
      return state;
  }
}
