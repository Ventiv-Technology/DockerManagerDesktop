// @flow
import React from 'react';
import Drawer from 'material-ui/Drawer';
import { connect } from 'react-redux';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import MdDashboard from 'react-icons/lib/md/dashboard';
import MdDns from 'react-icons/lib/md/dns';
import MdDevicesOther from 'react-icons/lib/md/devices-other';
import MdCloudQueue from 'react-icons/lib/md/cloud-queue';
import { browserHistory } from 'react-router';
import icons from '../utils/icons';

const Navigation = (props, context) => (
  <div>
    <Drawer open>
      <List>
        <Subheader>NAVIGATION</Subheader>
        <ListItem primaryText="Dashboard" leftIcon={(<MdDashboard />)} />
        <ListItem primaryText="Containers" leftIcon={(<MdDns />)} />

        <Subheader>CLUSTERS</Subheader>
        {props.servers.map(server => {
          const Icon = icons[server.icon].icon;
          const cluster = props.clusters[server.id];

          return (
            <ListItem
              key={server.id}
              primaryText={server.name}
              leftIcon={(<Icon style={{ color: server.connected ? 'green' : 'red' }} />)}
              nestedItems={renderTierList(server, cluster, props)}
              onTouchTap={() => props.router.push(`/clusters/${cluster.id}`)}
            />
          );
        })}
      </List>
    </Drawer>
  </div>
);

const renderTierList = (server, cluster, props) => {
  if (cluster && Object.keys(cluster).length > 1) {
    Object.keys(cluster).map(tierName => {
      const tier = cluster[tierName];
      return (
        <ListItem
          key={tierName}
          primaryText={tierName}
          leftIcon={(<MdCloudQueue />)}
          nestedItems={renderEnvironmentList(server, tierName, cluster, tier, props)}
          onTouchTap={() => props.router.push(`/clusters/${server.id}/${tierName}`)}
        />
      );
    });
  } else if (cluster) {
    const tierName = Object.keys(cluster)[0];
    const tier = cluster[tierName];
    return renderEnvironmentList(server, tierName, cluster, tier, props);
  }
};

const renderEnvironmentList = (server, tierName, cluster, tier, props) => (
  tier.map(environment => (
    <ListItem
      key={environment.id}
      primaryText={environment.description}
      leftIcon={(<MdDevicesOther />)}
      onTouchTap={() => props.router.push(`/clusters/${server.id}/${tierName}/${environment.id}`)}
    />
  ))
);

const mapStateToProps = (state) => ({
  servers: state.settings,
  clusters: state.environment,
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
