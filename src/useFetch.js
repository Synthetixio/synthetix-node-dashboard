import { useCallback } from 'react';
import { useSynthetix } from './useSynthetix';
import { getApiUrl } from './utils';

export const useFetch = () => {
  const [synthetix] = useSynthetix();
  const { chainId, token, logout } = synthetix;

  const authorisedFetch = useCallback(
    (url, options = {}) => {
      const { headers, ...rest } = options;

      const response = fetch(`${getApiUrl()}${url}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          ...headers,
        },
        ...rest,
      }).then((response) => {
        if (response.status === 403) {
          // something wrong with the token, logout!
          logout();
          throw new Error('JWT Invalid, re-login please');
        }
        return response;
      });

      return response;
    },
    [token, logout]
  );

  return {
    fetch: getApiUrl() === undefined || !token || !chainId ? null : authorisedFetch,
    chainId,
  };
};
