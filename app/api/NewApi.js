// @flow
import 'isomorphic-fetch';
import btoa from 'btoa';
import log from 'electron-log';

import { decrypt } from '../utils/encrypt';
import type { DockerManagerServerConfiguration, ServiceInstance, ApplicationConfiguration } from '../utils/Types';

const makeRequest = (serverInfo, url, init, useCredentials = true) => {
  const headers = new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' });
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

  getApplicationVersionsAsSelect(serverInfo: DockerManagerServerConfiguration, application: ApplicationConfiguration, q?: string) {
    const branch = (application.branches && application.branches.length > 0) ? `/${application.branches[0]}` : '';
    const query = q ? `?q=${q}` : '';

    return makeRequest(serverInfo, `api/environment/${application.tierName}/${application.environmentId}/app/${application.id}/versions${branch}${query}`)
      .then(json => ({ options: json.map(option => ({ value: option.id, label: option.text })) }));
  },

  deployApplication(serverInfo: DockerManagerServerConfiguration, application: ApplicationConfiguration, version: string) {
    return makeRequest(serverInfo, `api/environment/${application.tierName}/${application.environmentId}/app/${application.id}/${version}`, { method: 'POST', body: '{}' });
  },

  stopApplication(serverInfo: DockerManagerServerConfiguration, application: ApplicationConfiguration) {
    return makeRequest(serverInfo, `/api/environment/${application.tierName}/${application.environmentId}/app/alpha-mobile/stop`, { method: 'POST', body: '[]' });
  },

  startApplication(serverInfo: DockerManagerServerConfiguration, application: ApplicationConfiguration) {
    return makeRequest(serverInfo, `/api/environment/${application.tierName}/${application.environmentId}/app/alpha-mobile/start`, { method: 'POST', body: '[]' });
  },

  restartApplication(serverInfo: DockerManagerServerConfiguration, application: ApplicationConfiguration) {
    return makeRequest(serverInfo, `/api/environment/${application.tierName}/${application.environmentId}/app/alpha-mobile/restart`, { method: 'POST', body: '[]' });
  }
};

export default NewApi;
