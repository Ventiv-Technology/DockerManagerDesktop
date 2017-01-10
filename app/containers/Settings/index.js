/**
 *
 */
import React from 'react';
import FaWrench from 'react-icons/lib/fa/wrench';
import { connect } from 'react-redux';
import { NavPane, NavPaneItem } from 'react-desktop/windows';
import Select from 'react-select';
import TextField from 'material-ui/TextField';
import ElectronSettings from 'electron-settings';
import log from 'electron-log';

import { Button } from '../../components';
import styles from './index.css';
import { addServer, updateServerSettings, deleteServerSettings } from '../../actions/settings';
import { encrypt } from '../../utils/encrypt';
import icons from '../../utils/icons';

const saveSettings = (servers) => {
  const toSave = servers.map(server => ({ ...server, password: encrypt(server.password) }));
  ElectronSettings.set('servers', toSave)
    .then(() => window.close())
    .catch(err => log.error('Unable to save settings', err));
};

const renderIcon = (option) => {
  const Icon = option.icon;
  return (
    <div>
      <Icon /> {option.label}
    </div>
  );
};

const ServerEditor = (props) => (
  <div>
    <TextField
      hintText="Name"
      floatingLabelText="Friendly Server Name"
      value={props.server.name}
      onChange={e => props.updateServerSettings(props.server, 'name', e.target.value)}
      fullWidth
    />

    <TextField
      hintText="URL"
      floatingLabelText="Server URL"
      value={props.server.url}
      onChange={e => props.updateServerSettings(props.server, 'url', e.target.value)}
      fullWidth
    />

    <label className={styles.topMargin} htmlFor="icon">Icon</label>
    <Select
      name="icon"
      placeholder="Select Icon..."
      value={props.server.icon}
      options={Object.values(icons)}
      optionRenderer={renderIcon}
      valueRenderer={renderIcon}
      onChange={(option) => props.updateServerSettings(props.server, 'icon', option.value)}
    />

    <div className={styles.row}>
      <TextField
        hintText="User Name"
        floatingLabelText="User Name"
        value={props.server.username}
        onChange={e => props.updateServerSettings(props.server, 'username', e.target.value)}
      />

      <TextField
        hintText="Password"
        floatingLabelText="Password"
        type="password"
        value={props.server.password}
        onChange={e => props.updateServerSettings(props.server, 'password', e.target.value)}
      />
    </div>

    <div className={styles.topMargin}>
      <Button type="submit" color="blue" onClick={() => props.deleteServerSettings(props.server)}>Delete</Button>
    </div>
  </div>
);

const Settings = (props) => (
  <div className={styles.container}>
    <div className={styles.header}>
      <FaWrench className={styles.headerIcon} />
      <div className={styles.headerText}>Docker Manager Client Settings</div>
    </div>

    <div className={styles.body}>
      <NavPane openLength={200} push>
        {props.servers.map((server) => {
          const Icon = (icons[server.icon] && icons[server.icon].icon) || icons.QuestionCircle.icon;

          return (
            <NavPaneItem
              key={server.id}
              title={server.name}
              icon={<Icon />}
              theme="light"
              selected={server.selected}
              onSelect={() => props.updateServerSettings(server, 'selected', true)}
              padding="10px 20px"
              push
            >
              <ServerEditor server={server} {...props} />
            </NavPaneItem>
          );
        })}
      </NavPane>
    </div>

    <div className={styles.buttonStrip}>
      <div><Button onClick={props.addServer}>Add Server</Button></div>
      <div><Button onClick={() => window.close()}>Cancel</Button></div>
      <div><Button onClick={() => saveSettings(props.servers)} type="submit" color="blue">OK</Button></div>
    </div>
  </div>
);

const mapStateToProps = (state) => ({ servers: state.settings });

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    addServer: () => dispatch(addServer()),
    updateServerSettings: (server, path, value) => dispatch(updateServerSettings(server, path, value)),
    deleteServerSettings: (server) => dispatch(deleteServerSettings(server)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
