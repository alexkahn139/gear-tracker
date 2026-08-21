import { QueryClient, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { api } from '@/lib/api.js';
import type { User } from '@/lib/types.js';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export const queryClient = createQueryClient();

export function useMe(): UseQueryResult<User> {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<User>('/api/auth/me'),
  });
}
