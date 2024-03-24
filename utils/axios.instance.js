import axios from 'axios';

const next_env = process.env.NEXT_PUBLIC_ENV;

export let popoApiUrl =
  next_env === 'prod'
    ? 'https://api.popo.poapper.club'
    : 'https://api.popo-dev.poapper.club';
// : "http://localhost:4000";

export const PoPoAxios = axios.create({
  baseURL: popoApiUrl,
});

export const PopoCdnUrl = 'https://cdn.popo.poapper.club';

export const PopoCdnAxios = axios.create({
  baseURL: PopoCdnUrl,
});
