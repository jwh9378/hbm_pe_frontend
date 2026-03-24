import { useEffect, useRef, useCallback } from 'react';

export interface UseWebSocketOptions {
  url: string | null;
  onMessage: (event: MessageEvent) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  maxRetries?: number;
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  maxRetries = 5,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retryCountRef = useRef(0);

  // 콜백 함수들이 변경되어도 의존성 배열에 영향을 주지 않도록 ref로 관리합니다.
  const callbacksRef = useRef({ onMessage, onOpen, onClose, onError });

  useEffect(() => {
    callbacksRef.current = { onMessage, onOpen, onClose, onError };
  });

  const connect = useCallback(() => {
    if (!url) return;

    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onopen = (event) => {
      retryCountRef.current = 0;
      callbacksRef.current.onOpen?.(event);
    };

    socket.onmessage = (event) => {
      callbacksRef.current.onMessage(event);
    };

    socket.onerror = (event) => {
      callbacksRef.current.onError?.(event);
    };

    socket.onclose = (event) => {
      callbacksRef.current.onClose?.(event);

      // 1000은 정상 종료 코드입니다. 비정상 종료 시 지수 백오프 기반 재연결을 시도합니다.
      if (event.code !== 1000 && retryCountRef.current < maxRetries) {
        const delay = 1000 * (2 ** retryCountRef.current);
        retryCountRef.current += 1;
        reconnectTimerRef.current = setTimeout(connect, delay);
      }
    };
  }, [url, maxRetries]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        // 이벤트 리스너 제거
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000);
        }
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    } else {
      console.error('WebSocket is not connected.');
    }
  }, []);

  return { sendMessage };
}