import React from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatListProps,
  ListRenderItem,
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import EmptyState from './EmptyState';

interface DataListProps<T> {
  /** Array of items to display */
  data: T[];
  /** Render function for each item */
  renderItem: ListRenderItem<T>;
  /** Key extractor (defaults to index) */
  keyExtractor?: (item: T, index: number) => string;
  /** Pull-to-refresh handler */
  onRefresh?: () => void;
  /** Infinite scroll handler */
  onEndReached?: () => void;
  /** Message shown when the list is empty */
  emptyMessage?: string;
  /** Description shown below the empty message */
  emptyDescription?: string;
  /** Whether more data is being loaded (shows footer spinner) */
  loading?: boolean;
  /** Whether a refresh is in progress */
  refreshing?: boolean;
  /** Optional header component */
  ListHeaderComponent?: FlatListProps<T>['ListHeaderComponent'];
  /** Custom content container style */
  contentContainerStyle?: FlatListProps<T>['contentContainerStyle'];
}

/**
 * Loading footer shown while paginating.
 */
function ListFooter({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <View
      style={styles.footer}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading more items"
    >
      <ActivityIndicator size="small" color={Colors.primary} />
    </View>
  );
}

/**
 * Optimized list built on FlatList with pull-to-refresh, infinite scroll,
 * an empty state placeholder, and a loading footer.
 */
export default function DataList<T>({
  data,
  renderItem,
  keyExtractor,
  onRefresh,
  onEndReached,
  emptyMessage = 'No items found',
  emptyDescription,
  loading = false,
  refreshing = false,
  ListHeaderComponent,
  contentContainerStyle,
}: DataListProps<T>) {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor || ((_, index) => index.toString())}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={<ListFooter loading={loading && data.length > 0} />}
      ListEmptyComponent={
        loading ? (
          <View
            style={styles.loadingContainer}
            accessibilityRole="progressbar"
            accessibilityLabel="Loading items"
          >
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <EmptyState title={emptyMessage} description={emptyDescription} />
        )
      }
      contentContainerStyle={[
        data.length === 0 && styles.emptyContainer,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      accessibilityRole="list"
    />
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  loadingContainer: {
    paddingVertical: Spacing.xxxxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
  },
});
