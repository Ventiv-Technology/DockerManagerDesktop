// @flow
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { connect } from 'react-redux';
import { shell } from 'electron';
import dateFormat from 'dateformat';
import MdArrowForward from 'react-icons/lib/md/arrow-forward';
import selectn from 'selectn';

import styles from './index.css';
import { closeDialog } from '../../actions/dialog';

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

      <hr />

      <div className={styles.infoRow}>
        <div className={styles.infoRowLabel}>History Last {props.serviceInstance.history.page.size}:</div>
        <div className={styles.historyLogin}>Login</div>
        <div className={styles.historyPermission}>Permission</div>
        <div className={styles.historyTimestamp}>Timestamp</div>
        <div className={styles.historyDetails}>Details</div>
      </div>
      {selectn('serviceInstance.history._embedded.userAudits', props) && props.serviceInstance.history['_embedded'].userAudits.map((history, i) => (
        <div key={i} className={styles.infoRow}>
          <div className={styles.infoRowLabel} />
          <div className={styles.historyLogin}>{history.principal}</div>
          <div className={styles.historyPermission}>{history.permission}</div>
          <div className={styles.historyTimestamp}>{dateFormat(history.permissionEvaluated, 'm/d/yy h:MM TT')}</div>
          <div className={styles.historyDetails}>{JSON.stringify(history.auditDetails)}</div>
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
