import { useState, useEffect, useRef } from 'react';

import { BACKEND_URL } from 'src/config-global';

import { ConnectionStatus } from '../raspberry-status-widget';

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

  // WebSocket 객체와 타이머를 useRef로 관리하여 클린업에서 확실히 접근합니다.
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (!ipAddress) {
      setStatusData(INITIAL_STATUS);
      return undefined;
    }

    const safeBaseUrl = BACKEND_URL.replace(/\/+$/, '');
    const wsUrl = `${safeBaseUrl.replace(/^http/, 'ws')}/api/v1/raspberry/status/${ipAddress}`;

    let isMounted = true;
    const MAX_RETRIES = 5;

    retryCountRef.current = 0;
    setStatusData(INITIAL_STATUS);

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = undefined;
      }
    };

    const connect = () => {
      if (!isMounted) return;

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        if (!isMounted) return;
        console.log('WebSocket 연결 성공:', wsUrl);
        retryCountRef.current = 0;
      };

      socket.onmessage = (event) => {
        if (!isMounted) return;
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
      };

      socket.onerror = (error) => {
        if (!isMounted) return;
        console.error('WebSocket 오류 발생:', error);
      };

      socket.onclose = (event) => {
        if (!isMounted) return;

        // 웹소켓 연결이 끊어지면 장비 상태를 모두 'not ready'로 변경합니다.
        setStatusData((prev) => ({
          ...prev,
          backendStatus: 'not ready',
          piAStatus: 'not ready',
          piBStatus: 'not ready',
        }));

        // 정상 종료(1000)가 아니고 재시도 횟수가 남았을 때만 재연결
        if (event.code !== 1000 && retryCountRef.current < MAX_RETRIES) {
          // 재연결 간격을 점진적으로 늘림 (지수 백오프: 1초, 2초, 4초, 8초...)
          const delay = 1000 * (2 ** retryCountRef.current);
          retryCountRef.current += 1;
          reconnectTimerRef.current = setTimeout(connect, delay);
        }
      };
    };

    connect();

    // 클린업 함수
    return () => {
      isMounted = false;
      clearReconnectTimer();

      const socket = wsRef.current;
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;

        if (socket.readyState === WebSocket.OPEN) {
          socket.close(1000);
        }
        wsRef.current = null;
      }
    };
  }, [ipAddress]);

  return statusData;
}
