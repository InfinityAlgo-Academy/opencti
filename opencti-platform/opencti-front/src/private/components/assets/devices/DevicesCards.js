import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { pathOr } from 'ramda';
import ListCardsContent from '../../../../components/list_cards/ListCardsContent';
import { DeviceCard, DeviceCardDummy } from './DeviceCard';
import { setNumberOfElements } from '../../../../utils/Number';
import StixDomainObjectBookmarks, {
  stixDomainObjectBookmarksQuery,
} from '../../common/stix_domain_objects/StixDomainObjectBookmarks';
import { QueryRenderer } from '../../../../relay/environment';

const nbOfCardsToLoad = 50;

class DevicesCards extends Component {
  constructor(props) {
    super(props);
    this.state = { bookmarks: [] };
  }

  componentDidUpdate(prevProps) {
    setNumberOfElements(
      prevProps,
      this.props,
      'computingDeviceAssetList',
      this.props.setNumberOfElements.bind(this),
    );
  }

  handleSetBookmarkList(bookmarks) {
    this.setState({ bookmarks });
  }

  render() {
    const { initialLoading, relay, onLabelClick } = this.props;
    const { bookmarks } = this.state;
    return (
      <QueryRenderer
        query={stixDomainObjectBookmarksQuery}
        variables={{ types: ['Device'] }}
        render={({ props }) => (
          <div>
            <StixDomainObjectBookmarks
              data={props}
              onLabelClick={onLabelClick.bind(this)}
              setBookmarkList={this.handleSetBookmarkList.bind(this)}
            />
            <ListCardsContent
              initialLoading={initialLoading}
              loadMore={relay.loadMore.bind(this)}
              hasMore={relay.hasMore.bind(this)}
              isLoading={relay.isLoading.bind(this)}
              dataList={pathOr([], ['computingDeviceAssetList', 'edges'], this.props.data)}
              globalCount={pathOr(
                nbOfCardsToLoad,
                ['computingDeviceAssetList', 'pageInfo', 'globalCount'],
                this.props.data,
              )}
              CardComponent={<DeviceCard />}
              DummyCardComponent={<DeviceCardDummy />}
              nbOfCardsToLoad={nbOfCardsToLoad}
              onLabelClick={onLabelClick.bind(this)}
              bookmarkList={bookmarks}
            />
          </div>
        )}
      />
    );
  }
}

DevicesCards.propTypes = {
  data: PropTypes.object,
  extra: PropTypes.object,
  connectorsExport: PropTypes.array,
  relay: PropTypes.object,
  initialLoading: PropTypes.bool,
  onLabelClick: PropTypes.func,
  setNumberOfElements: PropTypes.func,
};

export const devicesCardsQuery = graphql`
  query DevicesCardsPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: ThreatActorsOrdering
    $orderMode: OrderingMode
    $filters: [ThreatActorsFiltering]
  ) {
    ...DevicesCards_data
      @arguments(
        search: $search
        count: $count
        cursor: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
        filters: $filters
      )
  }
`;

export const devicesCardsdarkLightRootQuery = graphql`
  query DevicesCardsDarkLightQuery {
    computingDeviceAssetList {
      edges {
        node {
          ...DeviceCard_node
        }
      }
    }
  }
`;

export default createPaginationContainer(
  DevicesCards,
  {
    data: graphql`
      fragment DevicesCards_data on Query
      @argumentDefinitions(
        search: { type: "String" }
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "ID" }
        orderBy: { type: "ThreatActorsOrdering", defaultValue: name }
        orderMode: { type: "OrderingMode", defaultValue: asc }
        filters: { type: "[ThreatActorsFiltering]" }
      ) {
        threatActors(
          search: $search
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
          filters: $filters
        ) @connection(key: "Pagination_threatActors") {
          edges {
            node {
              id
              name
              description
              # ...DeviceCard_node
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            globalCount
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.threatActors;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        search: fragmentVariables.search,
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
        filters: fragmentVariables.filters,
      };
    },
    query: devicesCardsQuery,
  },
);
