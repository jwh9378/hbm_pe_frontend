import { useState, useCallback } from 'react';

import { getCommandStatus } from 'src/sections/raspberry/raspberry-axios';

export function useCommandPolling() {
  const [isLoading, setIsLoading] = useState(false);

  const executeWithPolling = useCallback(
    async (commandAction: () => Promise<{ id: number }>, maxRetries: number = 6, intervalMs: number = 1000) => {
      setIsLoading(true);
      try {
        // 1. 명령 전송 (전달받은 함수 실행)
        const command = await commandAction();

        // 2. 상태 폴링
        for (let i = 0; i < maxRetries; i++) {
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
          const statusData = await getCommandStatus(command.id);

          if (statusData.status === 'SUCCESS') {
            return statusData; // 성공 시 결과 반환 및 루프 종료
          } else if (statusData.status === 'FAILED') {
            throw new Error('기기 응답 시간이 초과되어 명령이 실패했습니다.');
          }
          // 상태가 PENDING(진행 중)이면 다음 루프로 넘어감
        }

        throw new Error('상태 확인 시간이 초과되었습니다.');
      } finally {
        // 통신이 성공하든 실패하든 로딩 상태를 해제
        setIsLoading(false);
      }
    },
    []
  );

  return { isLoading, executeWithPolling };
}