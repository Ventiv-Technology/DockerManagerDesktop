// @flow
import _ from 'lodash';
import { UPDATE_ENVIRONMENT } from '../actions/environment';

const initialState = {};

export default function settings(state = initialState, action: Object) {
  switch (action.type) {
    case UPDATE_ENVIRONMENT:
      return { ...state, [action.dockerManagerServerId]: action.environment };
    default:
      return state;
  }
}
