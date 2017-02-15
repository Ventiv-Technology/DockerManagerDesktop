// @flow
import { OPEN_DIALOG, CLOSE_DIALOG } from '../actions/dialog';
import { UPDATE_SERVICE_INSTANCE } from '../actions/serviceInstances';

const initialState = {};

export default function settings(state: any = initialState, action: Object) {
  switch (action.type) {
    case OPEN_DIALOG:
      return { ...state, [action.dialogName]: action.dialogData };
    case CLOSE_DIALOG:
      return { ...state, [action.dialogName]: false };
    case UPDATE_SERVICE_INSTANCE: {
      if (state.serviceInstanceDetailsDialog && action.serviceInstance.containerId === state.serviceInstanceDetailsDialog.containerId) {
        return { ...state, serviceInstanceDetailsDialog: { ...action.serviceInstance, history: state.serviceInstanceDetailsDialog.history } };
      }

      return state;
    }
    default:
      return state;
  }
}
