import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

type ServerStatusContextType = {
  isServerReady: boolean;
  onServerReady: (cb: () => void) => void;
};

const ServerStatusContext = createContext<ServerStatusContextType>({
  isServerReady: false,
  onServerReady: () => {},
});

const POLL_INTERVAL_MS = 2000;

export function ServerStatusProvider({ children }: { children: React.ReactNode }) {
  const [isServerReady, setIsServerReady] = useState(false);
  const isReadyRef = useRef(false);
  const pendingCallbacksRef = useRef<Array<() => void>>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onServerReady = useCallback((cb: () => void) => {
    if (isReadyRef.current) {
      cb();
    } else {
      pendingCallbacksRef.current.push(cb);
    }
  }, []);

  useEffect(() => {
    const tryPing = async () => {
      try {
        await api.get('/ping');
        if (!isReadyRef.current) {
          isReadyRef.current = true;
          setIsServerReady(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          pendingCallbacksRef.current.forEach((cb) => cb());
          pendingCallbacksRef.current = [];
        }
      } catch {
        // Server not yet available, keep polling
      }
    };

    tryPing();
    intervalRef.current = setInterval(tryPing, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <ServerStatusContext.Provider value={{ isServerReady, onServerReady }}>
      {children}
    </ServerStatusContext.Provider>
  );
}

export function useServerStatus() {
  return useContext(ServerStatusContext);
}
