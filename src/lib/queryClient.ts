import { QueryClient } from '@tanstack/react-query';


const STALE_TIME = 1000 * 60;


export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME,
        retry: (failureCount, error) => {
          if (axios4xx(error)) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        throwOnError: false,
      },
    },
  });
}

function axios4xx(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    return status !== undefined && status >= 400 && status < 500;
  }
  return false;
}
