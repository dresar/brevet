'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';
import { useState, useEffect, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days (offline cache duration)
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storagePersister = createAsyncStoragePersister({
        storage: {
          getItem: async (key) => await get(key),
          setItem: async (key, value) => await set(key, value),
          removeItem: async (key) => await del(key),
        },
      });
      persistQueryClient({
        queryClient,
        persister: storagePersister,
      });
    }
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
