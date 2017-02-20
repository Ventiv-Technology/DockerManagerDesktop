// @flow
import React, { Component, PropTypes } from 'react';
import Drawer from 'material-ui/Drawer';
import { connect } from 'react-redux';
import { List, ListItem, makeSelectable } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import MdDashboard from 'react-icons/lib/md/dashboard';
import MdDns from 'react-icons/lib/md/dns';
import MdDevicesOther from 'react-icons/lib/md/devices-other';
import MdCloudQueue from 'react-icons/lib/md/cloud-queue';
import { browserHistory } from 'react-router';
import icons from '../utils/icons';

let SelectableList = makeSelectable(List);

function wrapState(ComposedComponent) {
  return class SelectableList extends Component {
    static propTypes = {
      children: PropTypes.node.isRequired,
      defaultValue: PropTypes.number.isRequired,
    };

    componentWillMount() {
      this.setState({
        selectedIndex: this.props.defaultValue,
      });
    }

    handleRequestChange = (event, index) => {
      this.setState({
        selectedIndex: index,
      });
    };

    render() {
      return (
        <ComposedComponent
          value={this.state.selectedIndex}
          onChange={this.handleRequestChange}
        >
          {this.props.children}
        </ComposedComponent>
      );
    }
  };
}

SelectableList = wrapState(SelectableList);

const Navigation = (props, context) => (
  <div>
    <Drawer open>
      <SelectableList defaultValue="Dashboard">
        <Subheader>NAVIGATION</Subheader>
        <ListItem value="Dashboard" primaryText="Dashboard" leftIcon={(<MdDashboard />)} />
        <ListItem value="Containers" primaryText="Containers" leftIcon={(<MdDns />)} />

        <Subheader>CLUSTERS</Subheader>
        {props.servers.map(server => {
          const Icon = icons[server.icon].icon;
          const cluster = props.clusters[server.id];

          return (
            <ListItem
              key={server.id}
              value={server.id}
              primaryText={server.name}
              leftIcon={(<Icon style={{ color: server.connected ? 'green' : 'red' }} />)}
              nestedItems={renderTierList(server, cluster, props)}
              onTouchTap={() => props.router.push(`/clusters/${cluster.id}`)}
            />
          );
        })}
      </SelectableList>
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
          value={tierName}
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
      value={environment.id}
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
