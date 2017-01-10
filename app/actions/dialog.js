import { ipcRenderer } from 'electron';     // TODO: Don't depend on this here - not reusable outside of Electron

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
  return dispatch => {
    const resp = ipcRenderer.sendSync('api-request', serviceInstance.dmServerInfo.id, 'getServiceInstanceHistory', serviceInstance);
    console.log(resp);
    resp.then(history => console.log("history", history));
    dispatch(openDialog('serviceInstanceDetailsDialog', serviceInstance));
  };
}
