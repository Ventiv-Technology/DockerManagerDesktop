// @flow
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import selectn from 'selectn';
import { shell } from 'electron';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import dateFormat from 'dateformat';
import Dialog from 'material-ui/Dialog';
import MdArrowForward from 'react-icons/lib/md/arrow-forward';

import styles from './index.css';
import { openDialog, closeDialog } from '../../actions/dialog';

const ServiceInstanceDetails = (props) => {
  if (!props.serviceInstance) return null;

  return (
    <div className={styles.container}>
      <div className={styles.infoRow}>
        <div className={styles.infoRowLabel}>Deployed Build:</div><div>{props.serviceInstance.containerImage.tag}</div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.infoRowLabel}>Status:</div><div>{props.serviceInstance.status} - {props.serviceInstance.containerStatus}</div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.infoRowLabel}>Deployed:</div><div>{dateFormat(props.serviceInstance.containerCreatedDate, 'm/d/yy h:MM TT')}</div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.infoRowLabel}>URL:</div><div><a onClick={() => shell.openExternal(props.serviceInstance.url)}>{props.serviceInstance.url}</a></div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.infoRowLabel}>Server Name:</div><div>{props.serviceInstance.serverName}</div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.infoRowLabel}>Instance Number:</div><div>{props.serviceInstance.instanceNumber}</div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.infoRowLabel}>Container Id:</div><div>{props.serviceInstance.containerId}</div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.infoRowLabel}>Container Image:</div><div>{props.serviceInstance.containerImage.name}:{props.serviceInstance.containerImage.tag}</div>
      </div>

      <hr />

      <div className={styles.infoRow}>
        <div className={styles.infoRowLabel}>Ports:</div><div className={styles.portType}><b>Port Type</b></div><div className={styles.portMapping}><b>Port Mapping</b></div>
      </div>
      {props.serviceInstance.portDefinitions.map((portDef, i) => (
        <div key={i} className={styles.infoRow}>
          <div className={styles.infoRowLabel} />
          <div className={styles.portType}>{portDef.portType}</div>
          <div className={styles.portMapping}>{portDef.hostPort} <MdArrowForward /> {portDef.containerPort}</div>
        </div>
      ))}
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  serviceInstance: state.dialog.serviceInstanceDetailsDialog
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    closeServiceInstanceDetails: () => dispatch(closeDialog('serviceInstanceDetailsDialog')),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceInstanceDetails);
