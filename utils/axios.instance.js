import axios from 'axios';

const next_env = process.env.NEXT_PUBLIC_ENV;

if (!next_env) {
  throw new Error('.env 파일에 NEXT_PUBLIC_ENV 환경변수가 설정되어 있지 않습니다.');
}

export const popoApiUrl =
  next_env === 'prod'
    ? 'https://api.popo.poapper.club'
    : next_env === 'dev'
      ? 'https://api.popo-dev.poapper.club'
      : next_env === 'local'
        ? 'https://localhost:4000'
        : (() => {
            throw new Error(`NEXT_PUBLIC_ENV 환경변수가 제대로 설정되어 있지 않습니다. ${next_env}는 유효하지 않은 값입니다.`);
          })();

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
        : (() => {
            throw new Error(`NEXT_PUBLIC_ENV 환경변수가 제대로 설정되어 있지 않습니다. ${next_env}는 유효하지 않은 값입니다.`);
          })();

export const PaxiAxios = axios.create({
  baseURL: paxiApiUrl,
  withCredentials: true,
});

export const PopoCdnUrl = 'https://cdn.popo.poapper.club';

export const PopoCdnAxios = axios.create({
  baseURL: PopoCdnUrl,
});
