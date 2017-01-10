// @flow
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import Star from 'material-ui/svg-icons/toggle/star';
import { Link } from 'react-router';
import selectn from 'selectn';

import styles from './index.css';
import ApplicationDetails from '../../components/ApplicationDetails';
import type { EnvironmentConfiguration } from '../../utils/Types';

type PropTypes = {
  server: any,
  cluster: any,
  tier: any,
  environment: EnvironmentConfiguration
};

const EnvironmentDetails = (props) => {
  if (!props.environment) return null;
  const FavoriteIcon = props.environment.favorite ? Star : StarBorder;
  const FavoriteIconColor = props.environment.favorite ? '#FECB2F' : 'black';

  return (
    <div className={styles.container}>
      <span className={styles.breadcrumbRow}>
        <IconButton><FavoriteIcon color={FavoriteIconColor} /></IconButton>
        <div>Clusters</div>
        <div>/</div>
        <div><Link to="/">{props.server.name}</Link></div>
        <div>/</div>
        <div><Link to="/">{props.environment.description}</Link></div>
      </span>
      <div className={styles.applications}>
        {props.environment.applications.map(app => (<ApplicationDetails key={app.id} app={app} />))}
      </div>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  server: state.settings.find(server => server.id === ownProps.params.clusterId),
  cluster: selectn(`environment.${ownProps.params.clusterId}`, state),
  tier: selectn(`environment.${ownProps.params.clusterId}.${ownProps.params.tierName}`, state),
  environment: (selectn(`environment.${ownProps.params.clusterId}.${ownProps.params.tierName}`, state) || []).find(env => env.id === ownProps.params.environmentId),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EnvironmentDetails);
