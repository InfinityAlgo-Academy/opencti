import { usePaginationFragment, usePreloadedQuery } from 'react-relay';
import { useEffect } from 'react';
import { PreloadedQuery } from 'react-relay/relay-hooks/EntryPointTypes';
import { GraphQLTaggedNode, OperationType } from 'relay-runtime';
import { KeyType } from 'react-relay/relay-hooks/helpers';
import { UseLocalStorage } from './useLocalStorage';

interface UsePreloadedPaginationFragment<QueryType extends OperationType> {
  queryRef: PreloadedQuery<QueryType>
  linesQuery: GraphQLTaggedNode
  linesFragment: GraphQLTaggedNode
  nodePath: string[]
  setNumberOfElements?: UseLocalStorage[2]['handleSetNumberOfElements']
}

const usePreloadedPaginationFragment = <QueryType extends OperationType, FragmentKey extends KeyType>({
  queryRef,
  linesQuery,
  linesFragment,
  nodePath,
  setNumberOfElements,
}: UsePreloadedPaginationFragment<QueryType>) => {
  const queryData = usePreloadedQuery(linesQuery, queryRef) as FragmentKey;
  const {
    data,
    hasNext,
    loadNext,
    isLoadingNext,
  } = usePaginationFragment<QueryType, FragmentKey>(linesFragment, queryData);
  useEffect(() => {
    const deep_value = nodePath.reduce((a, v) => a[v as keyof object], data as object) as unknown[];
    if (setNumberOfElements && deep_value) {
      setNumberOfElements({ number: deep_value.length });
    }
  }, [data]);

  return {
    data,
    hasMore: () => hasNext,
    isLoadingMore: () => isLoadingNext,
    loadMore: loadNext,
  };
};

export default usePreloadedPaginationFragment;
