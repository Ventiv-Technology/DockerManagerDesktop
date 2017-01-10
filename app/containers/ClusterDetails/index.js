// @flow
import React from 'react';
import { connect } from 'react-redux';

const ClusterDetails = (props) => {
  return (
    <div>
      Welcome to the cluster - this is an awesome place to be right now!
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
