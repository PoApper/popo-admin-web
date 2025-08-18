import axios from 'axios';

const next_env = process.env.NEXT_PUBLIC_ENV;

export const popoApiUrl =
  next_env === 'prod'
    ? 'https://api.popo.poapper.club'
    : next_env === 'dev'
      ? 'https://api.popo-dev.poapper.club'
      : next_env === 'local'
        ? 'https://localhost:4000'
        : new Error('NEXT_PUBLIC_ENV is not set or invalid');

export const PoPoAxios = axios.create({
  baseURL: popoApiUrl,
  withCredentials: true,
});

export const paxiApiUrl =
  next_env === 'prod'
    ? 'https://api.paxi.popo.poapper.club'
    : next_env === 'dev'
      ? 'https://api.paxi.popo-dev.poapper.club'
      : next_env === 'local'
        ? 'https://localhost:4100'
        : new Error('NEXT_PUBLIC_PAXI_ENV is not set or invalid');

export const PaxiAxios = axios.create({
  baseURL: paxiApiUrl,
  withCredentials: true,
});

export const PopoCdnUrl = 'https://cdn.popo.poapper.club';

export const PopoCdnAxios = axios.create({
  baseURL: PopoCdnUrl,
});
