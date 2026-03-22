import { useState, useCallback } from 'react';

export function useRaspberryIp() {
  const [ipAddress, setIpAddress] = useState(
    () => localStorage.getItem('target_device_ip') || '192.168.0.100'
  );

  const handleIpChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIpAddress(event.target.value);
  }, []);

  return { ipAddress, handleIpChange };
}