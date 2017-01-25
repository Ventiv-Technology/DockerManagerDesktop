// @flow
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import selectn from 'selectn';
import { shell } from 'electron';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import dateFormat from 'dateformat';
import Dialog from 'material-ui/Dialog';
import Select from 'react-select';

import ServiceInstanceDetails from '../ServiceInstanceDetails';
import styles from './index.css';
import Api from '../../api/NewApi';
import { openServiceInstanceDetailsDialog, closeDialog } from '../../actions/dialog';
import type { ApplicationConfiguration, ServiceInstance } from '../../utils/Types';

type PropTypes = {
  app: ApplicationConfiguration,
  serviceInstances: Array<ServiceInstance>
};

const ApplicationDetails = (props) => {
  // Determine URL (Could be hardcoded, or derived based on a serviceInstance)
  let url = props.app.url;
  if (!url) {
    const siUrl = props.serviceInstances.find(si => si.name === props.app.serviceInstanceUrl);
    url = siUrl ? siUrl.url : 'None Found';
  }

  // Determine Version(s)
  const versions = _.uniq(props.serviceInstances.map(si => si.containerImage.tag));

  // Determine missing serviceInstances
  const missingServiceInstances = _.flatMap(props.app.serviceInstances, appSi => (
    Array.from(Array(appSi.count)).map(() => ({ status: 'Missing', name: appSi.type }))
  ));
  props.serviceInstances.forEach(si => {
    const missingSi = missingServiceInstances.findIndex(missing => missing.name === si.name);
    missingServiceInstances.splice(missingSi, 1);
  });

  return (
    <div className={styles.application}>
      <Card>
        <CardHeader
          title={(<div>{props.app.description} <span className={styles.deployMessage}>{props.app.deployMessage}</span></div>)}
          subtitle={<a className={styles.headerLink} onClick={() => shell.openExternal(url)}>{url}</a>}   // eslint-disable-line
          actAsExpander
          showExpandableButton
        />
        <CardText expandable>
          <div className={styles.infoRow}>
            <div className={styles.infoRowLabel}>URL:</div><div><a onClick={() => shell.openExternal(url)}>{url}</a></div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoRowLabel}>Version(s):</div><div>{versions.join(', ')}</div>
          </div>

          <div className={styles.toolbar}>
            <Select.Async
              name="form-field-name"
              value={props.app.selectedVersion}
              className={styles.select}
              cache={false}
              autosize={false}
              onChange={option => props.dispatch(props.selectVersionForApp(props.app, option.value))}
              loadOptions={(input) => Api.getApplicationVersionsAsSelect(props.server, props.app, input)}
            />

            <RaisedButton label="Deploy" primary style={{ margin: 12 }} />
            <RaisedButton label="Stop" style={{ margin: 12 }} />
            <RaisedButton label="Start" style={{ margin: 12 }} />
            <RaisedButton label="Restart" style={{ margin: 12 }} />
            <RaisedButton label="History" style={{ margin: 12 }} />
          </div>

          <div className={styles.serviceInstances}>
            {props.serviceInstances.map(si => (
              <div key={si.containerId}>
                <RaisedButton
                  label={`${si.serviceDescription} on ${si.serverName} [${si.containerImage.tag} - deployed @ ${dateFormat(si.containerCreatedDate, 'm/d/yy h:MM TT')} - ${si.containerStatus}]`}
                  backgroundColor={si.status === 'Running' ? '#5cb85c' : '#d9534f'}
                  onClick={props.openServiceInstanceDetails.bind(this, si)}
                  labelColor="white"
                  fullWidth
                />
              </div>
            ))}
            {missingServiceInstances.map((si, i) => (
              <div key={i}>
                <RaisedButton
                  label={`${si.name} Missing`}
                  backgroundColor="#f0ad4e"
                  labelColor="white"
                  fullWidth
                />
              </div>
            ))}
          </div>
        </CardText>
      </Card>
      <Dialog
        title={`Service Instance: ${selectn('serviceInstanceDetailsDialog.serviceDescription', props)}`}
        actions={[
          (<FlatButton label="Remove" secondary onTouchTap={props.closeServiceInstanceDetails} />),
          (<FlatButton label="Stop" onTouchTap={props.closeServiceInstanceDetails} />),
          (<FlatButton label="Restart" onTouchTap={props.closeServiceInstanceDetails} />),
          (<FlatButton label="Logs" onTouchTap={props.closeServiceInstanceDetails} />),
          (<FlatButton label="Cancel" primary onTouchTap={props.closeServiceInstanceDetails} />),
        ]}
        open={!!props.serviceInstanceDetailsDialog}
        onRequestClose={props.closeServiceInstanceDetails}
      >
        <ServiceInstanceDetails />
      </Dialog>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  serviceInstances: _.sortBy(Object.keys(state.serviceInstances)
    .filter(siName => siName.startsWith(`${ownProps.app.tierName}/${ownProps.app.environmentId}/${ownProps.app.id}/`))
    .map(siName => (state.serviceInstances[siName])), ['serviceDescription', 'serverName']),
  serviceInstanceDetailsDialog: state.dialog.serviceInstanceDetailsDialog
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    openServiceInstanceDetails: (serviceInstance) => dispatch(openServiceInstanceDetailsDialog(serviceInstance)),
    closeServiceInstanceDetails: () => dispatch(closeDialog('serviceInstanceDetailsDialog')),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationDetails);
