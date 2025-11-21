import { QueryClient } from '@tanstack/react-query';
import { globalKeys } from '@/modules/shared/query-keys';

/**
 * Creates a QueryClient instance with shared configuration
 * Each entrypoint should call this once to get their QueryClient
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Disable automatic background refetching
        // since we're in a Chrome extension context
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        // Retry failed queries 3 times
        retry: 3,
        // Keep data fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
      },
    },
  });
}

/**
 * Type describing our "invalidate" payload stored in chrome.storage.
 *  - `queryKey`: Which React Query key(s) to invalidate
 *  - `ts`: A timestamp so watchers see a "new" value each time
 */
interface InvalidatePayload {
  queryKey: string[];
  ts: number;
}

// 1. A specialized WxtStorageItem to hold the "invalidate" signal.
// Note: storage is available globally in the wxt environment
const invalidateItem = storage.defineItem<InvalidatePayload | null>(
  "local:invalidate-queries",
  {
    fallback: null,
  }
);

/**
 * This function is called from ANY context to broadcast
 * an invalidation for `queryKey` to all other contexts.
 */
export async function invalidateQueriesGlobally(queryKey: string | string[]) {
  await invalidateItem.setValue({
    queryKey: typeof queryKey === 'string' ? [queryKey] : queryKey,
    ts: Date.now(),
  });
}

/**
 * This function is called from ANY context to broadcast
 * a clear all queries signal to all other contexts.
 */
export async function clearAllQueriesGlobally() {
  await invalidateItem.setValue({
    queryKey: [...globalKeys.clearAll],
    ts: Date.now(),
  });
}

/**
 * Call this ONCE per context (popup, content script, etc.) to watch
 * for changes to our `invalidateItem`. Whenever a change is detected,
 * we call `queryClient.invalidateQueries(queryKey)`.
 */
function registerGlobalInvalidationWatcher(queryClient: QueryClient) {
  // Start watching for changes in the stored invalidation payload
  const unwatch = invalidateItem.watch((newPayload) => {

    if (!newPayload) return;
    const { queryKey } = newPayload;
    console.log("Invalidating queries", queryKey);
    if (queryKey && queryKey.length > 0) {
      // Check if this is a clear all signal
      if (queryKey[0] === globalKeys.clearAll[0]) {
        console.log("Clearing all queries");
        queryClient.clear();
      } else {
        queryClient.invalidateQueries({ queryKey });
      }
    }
  });

  // Return the unwatch function in case you need to stop watching
  return unwatch;
}
export const queryClient = createQueryClient();
registerGlobalInvalidationWatcher(queryClient);