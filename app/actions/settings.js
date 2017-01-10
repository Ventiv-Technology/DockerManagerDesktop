export const ADD_SERVER = 'app/Settings/ADD_SERVER';
export const SAVE_SETTINGS = 'app/Settings/SAVE_SETTINGS';
export const UPDATE_SERVER_SETTINGS = 'app/Settings/UPDATE_SERVER_SETTINGS';
export const DELETE_SERVER_SETTINGS = 'app/Settings/DELETE_SERVER_SETTINGS';
export const SERVER_SETTINGS_CHANGED = 'app/Settings/SERVER_SETTINGS_CHANGED';

export function addServer() {
  return {
    type: ADD_SERVER,
  };
}

export function updateServerSettings(server, path, value) {
  return {
    type: UPDATE_SERVER_SETTINGS,
    server,
    path,
    value,
  };
}

export function deleteServerSettings(server) {
  return {
    type: DELETE_SERVER_SETTINGS,
    server,
  };
}

export function serverSettingsChanged(newValue, oldValue) {
  return {
    type: SERVER_SETTINGS_CHANGED,
    newValue,
    oldValue,
  };
}
