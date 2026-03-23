import { useState, useCallback } from 'react';

export function useRaspberryIp() {
  // 실제 통신에 사용되는 IP
  const [ipAddress, setIpAddress] = useState(
    () => localStorage.getItem('target_device_ip') || '192.168.0.100'
  );
  // UI 인풋 필드에 바인딩되는 IP (입력 중인 상태)
  const [inputIp, setInputIp] = useState(ipAddress);

  const handleIpChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputIp(event.target.value);
  }, []);

  const handleApplyIp = useCallback(() => {
    setIpAddress(inputIp);
    localStorage.setItem('target_device_ip', inputIp);
  }, [inputIp]);

  return { ipAddress, inputIp, handleIpChange, handleApplyIp };
}