// @flow
import React from 'react';
import { connect } from 'react-redux';

const TierDetails = (props) => {
  return (
    <div>
      Welcome to the tier
    </div>
  );
};

const mapStateToProps = (state) => ({ servers: state.settings });

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TierDetails);
