import React from 'react';

import {createSearchParams, useLocation, useNavigate, useSearchParams} from 'react-router-dom';

export function searchParamsToObject(searchParams) {
  return Object.fromEntries(Array.from(searchParams));
}

export function sortObject(params) {
  return Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)));
}

export function cleanObject(params) {
  const cleaned = Object.entries(params).filter(([, value]) => value !== undefined);
  return Object.fromEntries(cleaned);
}

export function makeParams(newParams) {
  return createSearchParams(sortObject(cleanObject(newParams)));
}

export function makeSearch(newParams) {
  return makeParams(newParams).toString();
}

export function useParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = React.useMemo(
    () => sortObject(searchParamsToObject(searchParams)),
    [searchParams]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const updateParams = React.useCallback(
    (newParams) => {
      setSearchParams(makeParams(newParams));
    },
    [params, setSearchParams]
  );

  return [params, updateParams];
}

export function getPageRoute(page) {
  return `/${page}`;
}

export function usePageRoute() {
  const location = useLocation();
  const pageRoute = React.useMemo(() => {
    const [, page] = location.pathname.match(/^\/([a-z-]+)$/i) ?? [];
    return page;
  }, [location.pathname]);

  const navigate = useNavigate();
  const setPageRoute = React.useCallback(
    (page) => {
      navigate(getPageRoute(page));
    },
    [navigate]
  );
  return [pageRoute, setPageRoute];
}
