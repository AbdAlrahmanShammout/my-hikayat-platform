import { useEffect, useState } from 'react';

import {
  fetchConnectivitySnapshot,
  subscribeConnectivity,
} from '@/native/connectivity/net-info-adapter';

/**
 * Observes actual device connectivity for kids-friendly offline UI.
 */
export function useConnectivity(): { readonly isOnline: boolean } {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  useEffect(() => {
    let isMounted = true;
    void fetchConnectivitySnapshot().then((snapshot) => {
      if (isMounted) {
        setIsOnline(snapshot.isOnline);
      }
    });
    const unsubscribe = subscribeConnectivity((snapshot) => {
      setIsOnline(snapshot.isOnline);
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);
  return { isOnline };
}
