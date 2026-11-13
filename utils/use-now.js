import { useEffect, useState } from 'react';
import moment from 'moment';

// 정적 사전 렌더링된 HTML과 어긋나지 않도록 마운트 전에는 null을 돌려주고, 이후 매 분 갱신한다.
export function useNow() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    let timer;
    const tick = () => {
      const current = moment();
      setNow(current);
      timer = setTimeout(tick, 60000 - (current.valueOf() % 60000));
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  return now;
}
