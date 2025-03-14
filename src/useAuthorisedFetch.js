import { useQuery } from '@tanstack/react-query';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export const useAuthorisedFetch = () => {
  const [synthetix] = useSynthetix();
  const { chainId, token, logout } = synthetix;

  return useQuery({
    queryKey: [chainId, 'useAuthorisedFetch'],
    enabled: Boolean(chainId && token && logout && getApiUrl()),
    retry: false,
    queryFn: async () => {
      return async (url, options = {}) => {
        const { headers, ...rest } = options;

        return await fetch(`${getApiUrl()}${url}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            ...headers,
          },
          ...rest,
        }).then((response) => {
          if (response.status === 403) {
            logout();
            throw new Error('JWT Invalid, re-login please');
          }
          return response;
        });
      };
    },
  });
};
