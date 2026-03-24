import { useState, useEffect, useMemo } from 'react';

import { useWebSocket } from 'src/hooks/use-websocket';

import { BACKEND_URL } from 'src/config-global';

export type ConnectionStatus = 'ready' | 'not ready';

interface RaspberryStatusData {
  backendStatus: ConnectionStatus;
  piAStatus: ConnectionStatus;
  piBStatus: ConnectionStatus;
  lastResult: string | null;
  lastUpdate: Date | null;
}

const INITIAL_STATUS: RaspberryStatusData = {
  backendStatus: 'not ready',
  piAStatus: 'not ready',
  piBStatus: 'not ready',
  lastResult: null,
  lastUpdate: null,
};

export function useRaspberryStatus(ipAddress: string) {
  const [statusData, setStatusData] = useState<RaspberryStatusData>(INITIAL_STATUS);

  useEffect(() => {
    setStatusData(INITIAL_STATUS);
  }, [ipAddress]);

  const wsUrl = useMemo(() => {
    if (!ipAddress) return null;
    const safeBaseUrl = BACKEND_URL.replace(/\/+$/, '');
    return `${safeBaseUrl.replace(/^http/, 'ws')}/api/v1/raspberry/status/${ipAddress}`;
  }, [ipAddress]);

  useWebSocket({
    url: wsUrl,
    onOpen: () => {
      console.log('WebSocket 연결 성공:', wsUrl);
    },
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        const rawLastUpdated = data.lastUpdated ?? data.last_updated;

        setStatusData({
          backendStatus: data.backendStatus ?? 'not ready',
          piAStatus: data.piAStatus ?? 'not ready',
          piBStatus: data.piBStatus ?? 'not ready',
          lastResult: data.lastResult || 'N/A',
          lastUpdate: (rawLastUpdated && rawLastUpdated !== 'N/A') ? new Date(rawLastUpdated) : null,
        });
      } catch (error) {
        console.error('WebSocket 메시지 파싱 오류:', error);
      }
    },
    onClose: () => {
      // 웹소켓 연결이 끊어지면 장비 상태를 모두 'not ready'로 변경합니다.
      setStatusData((prev) => ({
        ...prev,
        backendStatus: 'not ready',
        piAStatus: 'not ready',
        piBStatus: 'not ready',
      }));
    },
    onError: (error) => {
      console.error('WebSocket 오류 발생:', error);
    }
  });

  return statusData;
}
