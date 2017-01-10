export const UPDATE_ENVIRONMENT = 'app/Environment/UPDATE_ENVIRONMENT';

export function updateEnvironment(dockerManagerServerId, environment) {
  return {
    type: UPDATE_ENVIRONMENT,
    dockerManagerServerId,
    environment,
  };
}
