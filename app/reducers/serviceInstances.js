// @flow
import _ from 'lodash';
import { UPDATE_SERVICE_INSTANCE } from '../actions/serviceInstances';

const initialState = {};

export default function settings(state = initialState, action: Object) {
  switch (action.type) {
    case UPDATE_SERVICE_INSTANCE: {
      const si = action.serviceInstance;
      const fullName = `${si.tierName}/${si.environmentName}/${si.applicationId}/${si.name}/${si.serverName}/${si.instanceNumber}`;
      return { ...state, [fullName]: si };
    }
    default:
      return state;
  }
}
