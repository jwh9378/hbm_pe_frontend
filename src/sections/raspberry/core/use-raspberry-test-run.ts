import { useState, useEffect, useCallback, useMemo } from 'react';

import { useWebSocket } from 'src/hooks/use-websocket';
import { useErrorMessage } from 'src/hooks/error-message';

import { BACKEND_URL } from 'src/config-global';

import {
  sendTestCommand,
  fetchRaspberryQueue,
  addRaspberryQueue,
  removeRaspberryQueue,
} from '../hooks/use-raspberry-axios';

export const MOCK_SCENARIOS = [
  { label: 'Test Scenario 1 (Basic)' },
  { label: 'Test Scenario 2 (Advanced)' },
  { label: 'Test Scenario 3 (Full Check)' },
];

export interface QueueItem {
  id: number;
  name: string;
  status?: 'PENDING' | 'RUNNING' | 'FAILED' | 'COMPLETED' | string;
  createdAt: Date;
  created_at?: string;
  [key: string]: any;
}

interface WsMessage {
  type: string;
  status?: string;
  id?: number;
  message?: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function useTestRun(ipAddress: string) {
  const [selectedScenario, setSelectedScenario] = useState(MOCK_SCENARIOS[0].label);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [runningTest, setRunningTest] = useState<{ id: number; label: string } | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);

  const { errorMessage, setErrorMessage, handleCloseError } = useErrorMessage();

  const fetchQueue = useCallback(async () => {
    if (!ipAddress) return;
    try {
      const response = await fetchRaspberryQueue();
      const items = response.data || [];
      const sortedData = items
        .map((item: any): QueueItem => ({
          ...item,
          createdAt: new Date(item.created_at || item.createdAt || new Date()),
        }))
        .sort((a: QueueItem, b: QueueItem) => a.createdAt.getTime() - b.createdAt.getTime()); // 오래된 순(오름차순) 정렬

      const runningItems = sortedData.filter((item: QueueItem) => item.status === 'RUNNING');
      const pendingItems = sortedData.filter((item: QueueItem) => item.status === 'PENDING' || !item.status);

      if (runningItems.length > 0) {
        setRunningTest({ id: runningItems[0].id, label: runningItems[0].name });
        setIsRunning(true);
      } else {
        setRunningTest(null);
        setIsRunning(false);
      }

      setQueue(pendingItems);
      setTotalCount(response.total_count || 0);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    }
  }, [ipAddress]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRunning) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // 현재 실행 중인 테스트 ID가 변경되면(새로운 테스트가 시작되면) 경과 시간을 0으로 초기화
  useEffect(() => {
    setElapsedTime(0);
  }, [runningTest?.id]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const wsUrl = useMemo(() => {
    const safeBaseUrl = BACKEND_URL.replace(/\/+$/, '');
    return `${safeBaseUrl.replace(/^http/, 'ws')}/api/v1/raspberry/test-status`;
  }, []);

  useWebSocket({
    url: wsUrl,
    onOpen: () => {
      setIsWsConnected(true);
      fetchQueue();
    },
    onMessage: (event) => {
      try {
        const data: WsMessage = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (!data) return;

        // 상태 변경, 테스트 완료, 큐 일시정지 이벤트 발생 시 큐 상태를 최신화
        if (
          data.type === 'TEST_STATUS_CHANGED' ||
          data.type === 'TEST_COMPLETED' ||
          data.type === 'QUEUE_PAUSED'
        ) {
          fetchQueue();
        }

        // 테스트 실패 또는 큐 일시정지 시 스낵바(에러 메시지)에 메시지 출력
        if (data.type === 'TEST_COMPLETED' && data.status === 'FAILED') {
          setErrorMessage(`테스트가 실패했습니다. (ID: ${data.id})`);
        } else if (data.type === 'QUEUE_PAUSED') {
          setErrorMessage(data.message || '오류로 인해 테스트가 중지되었습니다.');
        }
      } catch (error) {
        // JSON 파싱 실패 시에도 안전하게 폴백으로 갱신
        fetchQueue();
      }
    },
    onClose: () => {
      setIsWsConnected(false);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      setIsWsConnected(false);
    },
  });

  const getErrorMessage = (error: unknown, defaultMessage: string) => {
    if (typeof error === 'object' && error !== null) {
      const err = error as any;
      return err.response?.data?.message || err.message || defaultMessage;
    }
    return defaultMessage;
  };

  const handleStart = async () => {
    if (isRunning) {
      setErrorMessage('이미 테스트가 실행 중입니다.');
      return;
    }

    if (queue.length === 0) {
      setErrorMessage('대기열에 실행할 테스트가 없습니다.');
      return;
    }

    try {
      await sendTestCommand('start');
    } catch (error) {
      console.error('Failed to start test:', error);
      setErrorMessage(getErrorMessage(error, '테스트 시작 중 오류가 발생했습니다.'));
    }
  };

  const handleStop = async () => {
    try {
      await sendTestCommand('stop');
    } catch (error) {
      console.error('Failed to stop test:', error);
      setErrorMessage(getErrorMessage(error, '테스트 정지 중 오류가 발생했습니다.'));
    }
  };

  const handleAddQueue = async () => {
    const scenario = MOCK_SCENARIOS.find((s) => s.label === selectedScenario);
    if (scenario) {
      try {
        await addRaspberryQueue({ name: scenario.label });
        fetchQueue();
      } catch (error) {
        console.error('Failed to add queue:', error);
        setErrorMessage(getErrorMessage(error, '대기열 추가 중 오류가 발생했습니다.'));
      }
    }
  };

  const handleRemoveQueue = async (id: number) => {
    try {
      // 낙관적 업데이트: 서버 응답을 기다리지 않고 화면에서 항목을 즉시 제거합니다.
      setQueue((prev) => prev.filter((item) => item.id !== id));
      setTotalCount((prev) => (prev > 0 ? prev - 1 : 0));
      await removeRaspberryQueue(id);
      fetchQueue();
    } catch (error) {
      console.error('Failed to remove queue:', error);
      // 에러가 발생할 경우, 서버와 싱크를 맞추기 위해 다시 데이터를 불러옵니다.
      fetchQueue();
      setErrorMessage(getErrorMessage(error, '대기열 삭제 중 오류가 발생했습니다.'));
    }
  };

  return {
    selectedScenario,
    setSelectedScenario,
    isRunning,
    elapsedTime,
    runningTest,
    queue,
    totalCount,
    isWsConnected,
    errorMessage,
    handleCloseError,
    handleStart,
    handleStop,
    handleAddQueue,
    handleRemoveQueue,
    formatTime,
  };
}
