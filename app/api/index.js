import 'isomorphic-fetch';
import btoa from 'btoa';
import log from 'electron-log';
import StateMachine from 'javascript-state-machine';
import EventEmitter from 'events';
import { decrypt } from '../utils/encrypt';

const stateMachineConfig = {
  initial: 'NOT_CONNECTED',
  events: [
    { name: 'connect', from: 'NOT_CONNECTED', to: 'CONNECTED_UNAUTHENTICATED' },
    { name: 'authorize', from: 'CONNECTED_UNAUTHENTICATED', to: 'CONNECTED' },
    { name: 'badCredentials', from: ['CONNECTED_UNAUTHENTICATED', 'CONNECTED'], to: 'CONNECTED_BAD_CREDENTIALS' },
    { name: 'disconnect', from: StateMachine.WILDCARD, to: 'NOT_CONNECTED' }
  ],
  callbacks: {
    onconnect: (e, from, to, api) => { log.debug(`Connected (UNAUTHENTICATED) to ${api.serverInfo.name}`); api.emit('connect', api); },
    onauthorize: (e, from, to, api) => { log.debug(`FULLY Connected to ${api.serverInfo.name}`); api.emit('authorize', api); },
    onbadCredentials: (e, from, to, api) => { log.error(`Authenitcation REJECTED for ${api.serverInfo.name}`); api.emit('badCredentials', api); },
    ondisconnect: (e, from, to, api, err) => { log.error(`Unable to connect to ${api.serverInfo.name}:`, err); api.emit('disconnect', api, err); }
  }
};

export default class Api extends EventEmitter {

  constructor(serverInfo) {
    super();

    // Basic Connection information
    const username = serverInfo.username;
    const password = decrypt(serverInfo.password);
    const basicStr = `${username}:${password}`;

    this.serverInfo = serverInfo;

    this.api = {
      state: StateMachine.create(stateMachineConfig),
      baseURL: serverInfo.url,
      headers: new Headers({
        Accept: 'application/json',
        Authorization: `Basic ${btoa(basicStr)}`
      }),
    };

    this.connect();
  }

  on(eventName, listener) {
    super.on(eventName, listener);

    if (eventName === 'connect' && (this.api.state.is('CONNECTED') || this.api.state.is('CONNECTED_UNAUTHENTICATED'))) {
      listener(this.api);
    } else if (eventName === 'authorize' && this.api.state.is('CONNECTED')) {
      listener(this.api);
    }
  }

  makeRequest(url, method = 'GET', useCredentials = true, ignoreConnected = false) {
    if (!ignoreConnected && !this.api.state.is('CONNECTED')) {
      return Promise.reject('Unable to make request, not connected');
    }

    let headers = new Headers({ Accept: 'application/json' });
    if (useCredentials) {
      headers = this.api.headers;
    }

    return fetch(`${this.api.baseURL}/${url}`, { method, headers })
      .then(response => response.json());
  }

  connect() {
    this.ping()
      .then(() => {
        this.api.state.connect(this);
        return this.ping(true)
          .then(() => {
            this.api.state.authorize(this);
            // TODO: At this point, we should have the permissions too

            return true;
          })
          .catch(err => {
            this.api.state.badCredentials(this, err);
            return false;
          });
      })
      .catch(err => {
        this.api.state.disconnect(this, err);
        return false;
      });
  }

  ping(useCredentials = false) {
    return this.makeRequest('health', 'GET', useCredentials, true)
      .then(data => {
        if (data.status !== 'UP') {
          throw `Remote DockerManager (${this.serverInfo.name}) is responding, but unhealthy`.toString();
        }

        return data;
      });
  }

  getEnvironments() {
    return this.makeRequest('api/environment');
  }

  getEnvironmentDetails(tierName: string, environmentName: string) {
    return this.makeRequest(`api/environment${tierName}/${environmentName}`);
  }

  getHosts() {
    return this.makeRequest('api/hosts');
  }

  getServiceInstanceHistory(si) {
    return this.makeRequest(`userAudits/search/findUserAuditsForServiceInstance?serverName=${si.serverName}&tierName=${si.tierName}&environmentName=${si.environmentName}&applicationId=${si.applicationId}&name=${si.name}&instanceNumber=${si.instanceNumber}&sort=permissionEvaluated,desc`);
  }

}
