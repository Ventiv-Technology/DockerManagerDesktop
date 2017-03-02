// @flow
import React from 'react';
import { connect } from 'react-redux';

import Terminal from '../../components/Terminal';

const ClusterDetails = (props) => {
  return (
    <div>
      Welcome to the cluster - this is an awesome place to be right now!
      <Terminal />
    </div>
  );
};

const mapStateToProps = (state) => ({ servers: state.settings });

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClusterDetails);
