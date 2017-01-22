export const UPDATE_ENVIRONMENT = 'app/Environment/UPDATE_ENVIRONMENT';
export const UPDATE_SELECTED_VERSION = 'app/Environment/UPDATE_SELECTED_VERSION';

export function updateEnvironment(dockerManagerServerId, environment) {
  return {
    type: UPDATE_ENVIRONMENT,
    dockerManagerServerId,
    environment,
  };
}

export function updateSelectedVersion(dockerManagerServerId, environment, application, selectedVersion) {
  return {
    type: UPDATE_SELECTED_VERSION,
    dockerManagerServerId,
    environment,
    application,
    selectedVersion,
  };
}
