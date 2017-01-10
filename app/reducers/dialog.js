// @flow
import { OPEN_DIALOG, CLOSE_DIALOG } from '../actions/dialog';

const initialState = {};

export default function settings(state: any = initialState, action: Object) {
  switch (action.type) {
    case OPEN_DIALOG:
      return { ...state, [action.dialogName]: action.dialogData };
    case CLOSE_DIALOG:
      return { ...state, [action.dialogName]: false };
    default:
      return state;
  }
}
