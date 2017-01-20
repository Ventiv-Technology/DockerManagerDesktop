import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import ElectronSettings from 'electron-settings';
import log from 'electron-log';
import DockerManagerEvents from './utils/DockerManagerEvents';
import Api from './api';
import { serverSettingsChanged, updateServerSettings } from './actions/settings';
import { updateEnvironment } from './actions/environment';
import { updateServiceInstance } from './actions/serviceInstances';

log.appName = 'DockerManager';

let menu;
let template;
let mainWindow = null;
let settingsWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support'); // eslint-disable-line
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
  const path = require('path'); // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
  require('module').globalPaths.push(p); // eslint-disable-line
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) { // eslint-disable-line
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {} // eslint-disable-line
    }
  }
};

app.on('ready', async () => {
  await installExtensions();

  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    // Listen to the Settings, and push them to the mainWindow
    ElectronSettings.observe('servers', ({ newValue, oldValue }) => {
      mainWindow.webContents.send('DISPATCH_REDUX_MESSAGE', serverSettingsChanged(newValue, oldValue));
    });

    // Connect to our servers, and get the environment informaiton.
    const servers = ElectronSettings.getSync('servers');
    if (servers) mainWindow.webContents.send('DISPATCH_REDUX_MESSAGE', serverSettingsChanged(servers));

    const allApis = (servers && servers.map(server => new Api(server))) || [];
    allApis.forEach(serverApi => {
      serverApi.on('authorize', (api) => {
        const dispatchUpdateServiceInstance = (serviceInstance) => {
          mainWindow.send('DISPATCH_REDUX_MESSAGE', updateServiceInstance(api.serverInfo.id, { ...serviceInstance, dmServerInfo: api.serverInfo }));
        };

        try {
          const dmEvents = new DockerManagerEvents(api.serverInfo);
          dmEvents.on('ContainerStartedEvent', event => dispatchUpdateServiceInstance(event.event.serviceInstance));
          dmEvents.on('ContainerStoppedEvent', event => dispatchUpdateServiceInstance(event.event.serviceInstance));

          // Use the DockerManagerEvents module to dictate when we're connected to the host.
          dmEvents.on('connect', () => {
            // Let the main window know we've connected
            mainWindow.send('DISPATCH_REDUX_MESSAGE', updateServerSettings(api.serverInfo, 'connected', true));

            // Fetch the environment details, and send them to the main window.
            api.getEnvironments()
              .then(data => mainWindow.send('DISPATCH_REDUX_MESSAGE', updateEnvironment(api.serverInfo.id, data)))
              .catch(err => log.error('Error Getting environment:', err));

            // Fetch each container, and send that to the main window.
            api.getHosts()
              .then(data => data.hostDetails.map(host => host.serviceInstances.map(dispatchUpdateServiceInstance)))
              .catch(err => log.error('Error Getting hosts:', err));
          });
          dmEvents.on('close', () => mainWindow.send('DISPATCH_REDUX_MESSAGE', updateServerSettings(api.serverInfo, 'connected', false)));

          app.on('before-quit', () => {
            dmEvents.shutdown();
          });
        } catch (e) {
          log.error('Trouble Initiating WebSocket', e);
        }
      });
    });

    ipcMain.on('api-request', (event, serverId, methodName, ...args) => {
      const api = allApis.find(searchApi => searchApi.serverInfo.id === serverId);
      if (api) {
        console.log('Calling API', serverId, methodName, args, api);
        const apiCallPromise = api[methodName].call(api, args);
        event.returnValue = apiCallPromise;   // eslint-disable-line
        apiCallPromise.then(data => {         // eslint-disable-line
          event.sender.send('api-response', serverId, methodName, args, data);
          return data;
        });
      }
    });

    mainWindow.show();
    mainWindow.focus();
    // mainWindow.toggleDevTools();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools();
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y);
        }
      }]).popup(mainWindow);
    });
  }

  if (process.platform === 'darwin') {
    template = [{
      label: 'Electron',
      submenu: [{
        label: 'About DockerManager',
        selector: 'orderFrontStandardAboutPanel:'
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: 'Hide DockerManager',
        accelerator: 'Command+H',
        selector: 'hide:'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:'
      }, {
        label: 'Show All',
        selector: 'unhideAllApplications:'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        }
      }]
    }, {
      label: 'Edit',
      submenu: [{
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:'
      }, {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      }, {
        type: 'separator'
      }, {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:'
      }, {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      }, {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:'
      }, {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      }]
    }, {
      label: 'View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: 'Reload',
        accelerator: 'Command+R',
        click() {
          mainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click() {
          mainWindow.toggleDevTools();
        }
      }] : [{
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }]
    }, {
      label: 'Window',
      submenu: [{
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:'
      }, {
        label: 'Close',
        accelerator: 'Command+W',
        selector: 'performClose:'
      }, {
        type: 'separator'
      }, {
        label: 'Bring All to Front',
        selector: 'arrangeInFront:'
      }]
    }, {
      label: 'Settings',
      submenu: [{
        label: 'Server Settings...',
        click() {
          if (!settingsWindow) {
            settingsWindow = new BrowserWindow({
              parent: mainWindow,
              modal: true,
              show: false,
              width: 800,
              height: 600
            });
            settingsWindow.loadURL(`file://${__dirname}/app.html#/settings`);

            settingsWindow.webContents.on('did-finish-load', () => {
              settingsWindow.show();
              settingsWindow.focus();
            });

            settingsWindow.on('closed', () => {
              settingsWindow = null;
            });
          }
        }
      }]
    }, {
      label: 'Help',
      submenu: [{
        label: 'Learn More',
        click() {
          shell.openExternal('http://electron.atom.io');
        }
      }, {
        label: 'Documentation',
        click() {
          shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
        }
      }, {
        label: 'Community Discussions',
        click() {
          shell.openExternal('https://discuss.atom.io/c/electron');
        }
      }, {
        label: 'Search Issues',
        click() {
          shell.openExternal('https://github.com/atom/electron/issues');
        }
      }]
    }];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    template = [{
      label: '&File',
      submenu: [{
        label: '&Open',
        accelerator: 'Ctrl+O'
      }, {
        label: '&Close',
        accelerator: 'Ctrl+W',
        click() {
          mainWindow.close();
        }
      }]
    }, {
      label: '&View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click() {
          mainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle &Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click() {
          mainWindow.toggleDevTools();
        }
      }] : [{
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }]
    }, {
      label: 'Help',
      submenu: [{
        label: 'Learn More',
        click() {
          shell.openExternal('http://electron.atom.io');
        }
      }, {
        label: 'Documentation',
        click() {
          shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
        }
      }, {
        label: 'Community Discussions',
        click() {
          shell.openExternal('https://discuss.atom.io/c/electron');
        }
      }, {
        label: 'Search Issues',
        click() {
          shell.openExternal('https://github.com/atom/electron/issues');
        }
      }]
    }];
    menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
  }
});
