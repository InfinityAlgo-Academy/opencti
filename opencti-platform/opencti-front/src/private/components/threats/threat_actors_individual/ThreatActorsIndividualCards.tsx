import { graphql, PreloadedQuery } from 'react-relay';
import { FunctionComponent, useState } from 'react';
import {
  HandleAddFilter,
  UseLocalStorageHelpers,
} from '../../../../utils/hooks/useLocalStorage';
import usePreloadedPaginationFragment from '../../../../utils/hooks/usePreloadedPaginationFragment';
import ListCardsContent from '../../../../components/list_cards/ListCardsContent';
import ThreatActorIndividualCard from './ThreatActorIndividualCard';
import { GenericAttackCardDummy } from '../../common/cards/GenericAttackCard';
import StixDomainObjectBookmarks, {
  stixDomainObjectBookmarksQuery,
} from '../../common/stix_domain_objects/StixDomainObjectBookmarks';
import { ThreatActorsIndividualCardsPaginationQuery } from './__generated__/ThreatActorsIndividualCardsPaginationQuery.graphql';
import { ThreatActorsIndividualCards_data$key } from './__generated__/ThreatActorsIndividualCards_data.graphql';
import { StixDomainObjectBookmarksQuery$data } from '../../common/stix_domain_objects/__generated__/StixDomainObjectBookmarksQuery.graphql';
import { QueryRenderer } from '../../../../relay/environment';

const nbOfCardsToLoad = 20;

export const threatActorsIndividualCardsPaginationQuery = graphql`
  query ThreatActorsIndividualCardsPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: ThreatActorsIndividualOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...ThreatActorsIndividualCards_data
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

export const ThreatActorsIndividualCardsFragment = graphql`
  fragment ThreatActorsIndividualCards_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: { type: "ThreatActorsIndividualOrdering", defaultValue: name }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "ThreatActorsIndividualRefetchQuery") {
    threatActorsIndividuals(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_threatActorsIndividuals") {
      edges {
        node {
          id
          name
          description
          ...ThreatActorIndividualCard_node
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        globalCount
      }
    }
  }
`;

interface ThreatActorsIndividualCardsProps {
  queryRef: PreloadedQuery<ThreatActorsIndividualCardsPaginationQuery>;
  setNumberOfElements: UseLocalStorageHelpers['handleSetNumberOfElements'];
  onLabelClick: HandleAddFilter;
}

const ThreatActorsIndividualCards: FunctionComponent<
ThreatActorsIndividualCardsProps
> = ({ setNumberOfElements, queryRef, onLabelClick }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const { data, hasMore, loadMore, isLoadingMore } = usePreloadedPaginationFragment<
  ThreatActorsIndividualCardsPaginationQuery,
  ThreatActorsIndividualCards_data$key
  >({
    linesQuery: threatActorsIndividualCardsPaginationQuery,
    linesFragment: ThreatActorsIndividualCardsFragment,
    queryRef,
    nodePath: ['threatActorsIndividuals', 'pageInfo', 'globalCount'],
    setNumberOfElements,
  });
  const handleSetBookmarkList = (newBookmarks: []) => {
    setBookmarks(newBookmarks);
  };
  return (
    <QueryRenderer
      query={stixDomainObjectBookmarksQuery}
      variables={{ types: ['Threat-Actor-Individual'] }}
      render={({ props }: { props: StixDomainObjectBookmarksQuery$data }) => (
        <>
          <StixDomainObjectBookmarks
            data={props}
            onLabelClick={onLabelClick}
            setBookmarkList={handleSetBookmarkList}
          />
          <ListCardsContent
            initialLoading={!data}
            loadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoadingMore}
            DummyCardComponent={GenericAttackCardDummy}
            dataList={data?.threatActorsIndividuals?.edges ?? []}
            globalCount={
              data?.threatActorsIndividuals?.pageInfo?.globalCount
              ?? nbOfCardsToLoad
            }
            CardComponent={ThreatActorIndividualCard}
            nbOfCardsToLoad={nbOfCardsToLoad}
            onLabelClick={onLabelClick}
            bookmarkList={bookmarks}
            rowHeight={350}
          />
        </>
      )}
    />
  );
};

export default ThreatActorsIndividualCards;
