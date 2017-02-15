// @flow
import React from 'react';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import selectn from 'selectn';

import Api from '../api/NewApi';
import ServiceInstanceDetails from '../components/ServiceInstanceDetails';
import { closeDialog } from '../actions/dialog';

const Dialogs = (props) => (
  <div>
    <Dialog
      title={`Service Instance: ${selectn('serviceInstanceDetailsDialog.serviceDescription', props)}`}
      actions={[
        (<FlatButton label="Remove" secondary onTouchTap={props.closeServiceInstanceDetails} />),
        selectn('serviceInstanceDetailsDialog.status', props) === 'Running' ? (<FlatButton label="Stop" onTouchTap={() => Api.stopContainer(props.serviceInstanceDetailsDialog.dmServerInfo, props.serviceInstanceDetailsDialog)} />) : null,
        selectn('serviceInstanceDetailsDialog.status', props) === 'Stopped' ? (<FlatButton label="Start" onTouchTap={() => Api.startContainer(props.serviceInstanceDetailsDialog.dmServerInfo, props.serviceInstanceDetailsDialog)} />) : null,
        (<FlatButton label="Logs" onTouchTap={props.closeServiceInstanceDetails} />),
        (<FlatButton label="Cancel" primary onTouchTap={props.closeServiceInstanceDetails} />),
      ]}
      open={!!props.serviceInstanceDetailsDialog}
      onRequestClose={props.closeServiceInstanceDetails}
    >
      <ServiceInstanceDetails />
    </Dialog>

    <Dialog
      title={selectn('alertDialog.title', props)}
      actions={[
        (<FlatButton label="OK" primary onTouchTap={props.closeAlert} />),
      ]}
      open={!!props.alertDialog}
      onRequestClose={props.closeAlert}
    >
      <div>{selectn('alertDialog.message', props)}</div>
    </Dialog>
  </div>
);

const mapStateToProps = (state, ownProps) => ({
  serviceInstanceDetailsDialog: state.dialog.serviceInstanceDetailsDialog,
  alertDialog: state.dialog.alert,
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    closeServiceInstanceDetails: () => dispatch(closeDialog('serviceInstanceDetailsDialog')),
    closeAlert: () => dispatch(closeDialog('alert')),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dialogs);
