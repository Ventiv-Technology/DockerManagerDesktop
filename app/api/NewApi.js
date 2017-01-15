// @flow
import 'isomorphic-fetch';
import btoa from 'btoa';
import log from 'electron-log';

import { decrypt } from '../utils/encrypt';
import type { DockerManagerServerConfiguration, ServiceInstance } from '../utils/Types';

const makeRequest = (serverInfo, url, init, useCredentials = true) => {
  const headers = new Headers({ Accept: 'application/json' });
  if (useCredentials) {
    const username = serverInfo.username;
    const password = decrypt(serverInfo.password);
    const basicStr = `${username}:${password}`;

    headers.append('Authorization', `Basic ${btoa(basicStr)}`);
  }

  const params = { ...init, headers };
  if (!params.method) params.method = 'GET';

  return fetch(`${serverInfo.url}/${url}`, params)
    .then(response => response.json());
};

const NewApi = {
  connect(serverInfo: DockerManagerServerConfiguration) {
    return NewApi.ping(serverInfo)
      .then(() => NewApi.ping(true))
      .catch(err => log.error(err));
  },

  ping(serverInfo: DockerManagerServerConfiguration, useCredentials: boolean = false) {
    return makeRequest(serverInfo, 'health', { method: 'GET' }, useCredentials)
      .then(data => {
        if (data.status !== 'UP') {
          throw `Remote DockerManager (${serverInfo.name}) is responding, but unhealthy`.toString();
        }

        return data;
      });
  },

  getEnvironments(serverInfo: DockerManagerServerConfiguration) {
    return makeRequest(serverInfo, 'api/environment');
  },

  getEnvironmentDetails(serverInfo: DockerManagerServerConfiguration, tierName: string, environmentName: string) {
    return makeRequest(serverInfo, `api/environment${tierName}/${environmentName}`);
  },

  getHosts(serverInfo: DockerManagerServerConfiguration) {
    return makeRequest(serverInfo, 'api/hosts');
  },

  getServiceInstanceHistory(serverInfo: DockerManagerServerConfiguration, si: ServiceInstance) {
    return makeRequest(serverInfo, `userAudits/search/findUserAuditsForServiceInstance?serverName=${si.serverName}&tierName=${si.tierName}&environmentName=${si.environmentName}&applicationId=${si.applicationId}&name=${si.name}&instanceNumber=${si.instanceNumber}&sort=permissionEvaluated,desc`);
  },
};

export default NewApi;