/*
 * Handles the WebSocket Connection to DockerManager for a given serverInfo.
 * Will also handle re-connection logic.
 *
 * @flow
 */
import { client as WebSocketClient } from 'websocket';
import Stomp from 'stompjs';
import btoa from 'btoa';
import EventEmitter from 'events';
import log from 'electron-log';

import { decrypt } from './encrypt';
import type { DockerManagerServerConfiguration } from './Types';

export default class DockerManagerEvents extends EventEmitter {

  serverInfo: DockerManagerServerConfiguration;
  stompClient: Stomp;

  constructor(serverInfo: DockerManagerServerConfiguration) {
    super();
    this.serverInfo = serverInfo;

    this.connect();
  }

  connect() {
    const webSocketClient = new WebSocketClient();
    const username = this.serverInfo.username;
    const password = decrypt(this.serverInfo.password);
    const basicStr = btoa(`${username}:${password}`);
    const url = this.serverInfo.url.replace('https:', 'wss').replace('http:', 'ws:');

    const clientId = Math.floor(Math.random() * 1000);
    const sessionId = Math.random().toString(36).substring(2, 10);

    webSocketClient.once('connect', this.wsConnected.bind(this));
    webSocketClient.once('connectFailed', () => {
      log.debug(`WebSocket Connection to ${this.serverInfo.name} failed.  Retrying in 10s`);
      setTimeout(this.connect.bind(this), 10000);
    });
    webSocketClient.connect(`${url}/api/status/${clientId}/${sessionId}/websocket`, undefined, undefined, { Authorization: `Basic ${basicStr}` });

    log.debug('WebSocket Connecting to', `${url}/api/status/${clientId}/${sessionId}/websocket`);
  }

  wsConnected(wsConnection: any) {
    wsConnection.send = (data) => wsConnection.sendUTF(JSON.stringify([data.toString()]));  // eslint-disable-line
    this.stompClient = Stomp.over(wsConnection);

    wsConnection.on('message', message => {
      if (message.utf8Data.startsWith('a')) {
        wsConnection.onmessage({ data: JSON.parse(message.utf8Data.substring(1))[0] });
      } else {
        wsConnection.onmessage({ data: message.utf8Data });
      }
    });
    wsConnection.on('close', () => {
      log.debug('WebSocket Connection Closed to: ', this.serverInfo.name);
      wsConnection.onclose();
      this.shutdown();
      this.emit('close');
      this.connect();
    });

    this.stompClient.connect(this.serverInfo.username, decrypt(this.serverInfo.password), () => {
      this.eventNames().forEach(eventName => {
        this.stompClient.subscribe(`/topic/event/${eventName}`, (frame) => this.emit(eventName, JSON.parse(frame.body)));
      });
      this.emit('connect');
    });

    wsConnection.onopen();
  }

  shutdown() {
    this.stompClient.disconnect();
  }
}
