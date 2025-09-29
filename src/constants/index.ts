export const API_URL = 'https://3d4txp0w-4000.asse.devtunnels.ms/api/v1/admin';
export const FILE_URL = 'https://quick-handyman.s3.eu-north-1.amazonaws.com';

type FetcherArgs = Parameters<typeof fetch>;

export const fetcher = (...args: FetcherArgs): Promise<any> =>
  fetch(...args).then(res => res.json());

export const fetcherWithCredentials = (...args: FetcherArgs): Promise<any> => {
  const [resource, config = {}] = args;
  return fetch(resource, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      'auth-token': `${localStorage.getItem('token')}`,
      cors: 'no-cors',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  }).then(res => res.json());
};
export const PRIMARY_COLOR = '#40A579';
