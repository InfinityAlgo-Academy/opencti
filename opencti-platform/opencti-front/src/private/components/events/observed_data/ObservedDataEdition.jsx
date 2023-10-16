import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { graphql } from 'react-relay';
import ObservedDataEditionContainer from './ObservedDataEditionContainer';
import { commitMutation, QueryRenderer } from '../../../../relay/environment';
import { observedDataEditionOverviewFocus } from './ObservedDataEditionOverview';
import Loader from '../../../../components/Loader';

export const observedDataEditionQuery = graphql`
  query ObservedDataEditionContainerQuery($id: String!) {
    observedData(id: $id) {
      ...ObservedDataEditionContainer_observedData
    }
  }
`;

class ObservedDataEdition extends Component {
  handleClose() {
    commitMutation({
      mutation: observedDataEditionOverviewFocus,
      variables: {
        id: this.props.observedDataId,
        input: { focusOn: '' },
      },
    });
  }

  render() {
    const { observedDataId } = this.props;
    return (
      <QueryRenderer
        query={observedDataEditionQuery}
        variables={{ id: observedDataId }}
        render={({ props }) => {
          if (props) {
            return (
              <ObservedDataEditionContainer
                observedData={props.observedData}
                handleClose={this.handleClose.bind(this)}
              />
            );
          }
          return <Loader variant="inElement" />;
        }}
      />
    );
  }
}

ObservedDataEdition.propTypes = {
  observedDataId: PropTypes.string,
};

export default ObservedDataEdition;
