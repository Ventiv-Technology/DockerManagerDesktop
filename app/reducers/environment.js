// @flow
import set from 'lodash/fp/set';
import findIndex from 'lodash/findIndex';
import { UPDATE_ENVIRONMENT, UPDATE_SELECTED_VERSION, UPDATE_APPLICATION } from '../actions/environment';

const initialState = {};

export default function settings(state = initialState, action: Object) {
  switch (action.type) {
    case UPDATE_ENVIRONMENT:
      return { ...state, [action.dockerManagerServerId]: action.environment };
    case UPDATE_SELECTED_VERSION: {
      const envIndex = findIndex(state[action.dockerManagerServerId][action.environment.tierName], env => env.id === action.environment.id);
      const appIndex = findIndex(state[action.dockerManagerServerId][action.environment.tierName][envIndex].applications, app => app.id === action.application.id);

      return set(`${action.dockerManagerServerId}.${action.environment.tierName}[${envIndex}].applications[${appIndex}].selectedVersion`)(action.selectedVersion)(state);
    }
    case UPDATE_APPLICATION: {
      const envIndex = findIndex(state[action.dockerManagerServerId][action.tierName], env => env.id === action.environmentId);
      const appIndex = findIndex(state[action.dockerManagerServerId][action.tierName][envIndex].applications, app => app.id === action.applicationId);

      return set(`${action.dockerManagerServerId}.${action.tierName}[${envIndex}].applications[${appIndex}].${action.field}`)(action.value)(state);
    }
    default:
      return state;
  }
}
