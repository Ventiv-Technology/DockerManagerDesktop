import Api from '../api/NewApi';
import { updateServiceInstance } from './serviceInstances';

export const OPEN_DIALOG = 'app/Dialog/OPEN_DIALOG';
export const CLOSE_DIALOG = 'app/Dialog/CLOSE_DIALOG';

export function openDialog(dialogName, dialogData) {
  return {
    type: OPEN_DIALOG,
    dialogName,
    dialogData
  };
}

export function closeDialog(dialogName) {
  return {
    type: CLOSE_DIALOG,
    dialogName,
  };
}

// Specific Dialogs - That require more information
export function openServiceInstanceDetailsDialog(serviceInstance) {
  return dispatch => (
    Api.getServiceInstanceHistory(serviceInstance.dmServerInfo, serviceInstance)
      .then(history => dispatch(updateServiceInstance(serviceInstance.dmServerInfo.id, { ...serviceInstance, history })))
      .then(updateAction => dispatch(openDialog('serviceInstanceDetailsDialog', updateAction.serviceInstance)))
  );
}

export function openAlert(title, message) {
  return openDialog('alert', { title, message });
}
