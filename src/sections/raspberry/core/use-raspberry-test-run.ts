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
  { label: 'Test Scenario 4 (Quick Run)' },
];

type TestStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ABORTED' | 'ERROR';

export interface QueueItem {
  id: number;
  name: string;
  status: TestStatus;
  created_at: Date;
  started_at: Date | null;
}

type WsMessage =
  | { type: 'TEST_STATUS_CHANGED'; id: number; status: 'PENDING' | 'RUNNING' }
  | { type: 'TEST_COMPLETED'; id: number; status: 'COMPLETED' }
  | { type: 'QUEUE_PAUSED'; id: number; status: 'ABORTED' | 'ERROR'; message?: string }
  | { type: 'TEST_PLAN_PROGRESS'; payload: { step_index: number; total_steps: number; current_tc: string; [key: string]: any } };

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function useTestRun(ipAddress: string) {
  const [selectedScenario, setSelectedScenario] = useState(MOCK_SCENARIOS[0].label);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [runningTest, setRunningTest] = useState<{ id: number; label: string, started_at: Date} | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [progressInfo, setProgressInfo] = useState<{ step_index: number; total_steps: number; current_tc: string } | null>(null);

  const { errorMessage, setErrorMessage, handleCloseError } = useErrorMessage();

  const fetchQueue = useCallback(async () => {
    try {
      if (!ipAddress) return;
      const response = await fetchRaspberryQueue(ipAddress);
      const items = response.data || [];
      const sortedData = items
        .map((item: any): QueueItem => ({
          ...item,
          created_at: new Date(item.created_at || new Date()),
          started_at: item.started_at ? new Date(item.started_at) : null,
        }))

      const runningItems = sortedData.filter((item: QueueItem) => item.status === 'RUNNING');
      const pendingItems = sortedData.filter((item: QueueItem) => item.status === 'PENDING' || !item.status);

      if (runningItems.length > 0) {
        setRunningTest({
          id: runningItems[0].id,
          label: runningItems[0].name,
          started_at: runningItems[0].started_at
        });
        setIsRunning(true);
      } else {
        setRunningTest(null);
        setIsRunning(false);
        setProgressInfo(null);
      }

      setQueue(pendingItems);
      setTotalCount(response.total_count || 0);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    }
  }, [ipAddress]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRunning && runningTest?.started_at) {
      timer = setInterval(() => {
        const elapsed_time = Math.floor(
          (Date.now() - new Date(runningTest.started_at).getTime()) / 1000
        );
        setElapsedTime(Math.max(elapsed_time, 0));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [isRunning, runningTest]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const wsUrl = useMemo(() => {
    if (!ipAddress) return null;
    const safeBaseUrl = BACKEND_URL.replace(/\/+$/, '');
    return `${safeBaseUrl.replace(/^http/, 'ws')}/api/v1/raspberry/test-status/${ipAddress}`;
  }, [ipAddress]);

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

        if (data.type === 'TEST_PLAN_PROGRESS') {
          const { step_index, total_steps, current_tc } = data.payload;
          setProgressInfo({ step_index, total_steps, current_tc });
          return;
        }
        // 상태 변경, 테스트 완료, 큐 일시정지 이벤트 발생 시 큐 상태를 최신화
        else if (
          data.type === 'TEST_STATUS_CHANGED' ||
          data.type === 'TEST_COMPLETED' ||
          data.type === 'QUEUE_PAUSED'
        ) {
          fetchQueue();
        }

        // 테스트 실패 또는 큐 일시정지 시 스낵바(에러 메시지)에 메시지 출력
        if (data.type === 'QUEUE_PAUSED' && data.status === 'ABORTED') {
          setErrorMessage(`테스트가 중지되었습니다. (REQ-ID: ${data.id})`);
        } else if (data.type === 'QUEUE_PAUSED' && data.status === 'ERROR') {
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
      await sendTestCommand(ipAddress, 'start');
    } catch (error) {
      console.error('Failed to start test:', error);
      setErrorMessage(getErrorMessage(error, '테스트 시작 중 오류가 발생했습니다.'));
    }
  };

  const handleStop = async () => {
    try {
      await sendTestCommand(ipAddress, 'stop');
    } catch (error) {
      console.error('Failed to stop test:', error);
      setErrorMessage(getErrorMessage(error, '테스트 정지 중 오류가 발생했습니다.'));
    }
  };

  const handleAddQueue = async () => {
    const scenario = MOCK_SCENARIOS.find((s) => s.label === selectedScenario);
    if (scenario) {
      try {
        await addRaspberryQueue({ name: scenario.label, target_device_ip: ipAddress });
        await fetchQueue();
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
      await fetchQueue();
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
    progressInfo,
  };
}
