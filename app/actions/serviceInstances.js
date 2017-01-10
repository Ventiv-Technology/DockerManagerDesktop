export const UPDATE_SERVICE_INSTANCE = 'app/Environment/UPDATE_SERVICE_INSTANCE';

export function updateServiceInstance(dockerManagerServerId, serviceInstance) {
  return {
    type: UPDATE_SERVICE_INSTANCE,
    dockerManagerServerId,
    serviceInstance,
  };
}
