import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { useRaspberryIp } from '../hooks/use-raspberry-ip';
import { RaspberryIpSetting } from '../raspberry-ip-setting';
import { TestRunWidget } from '../raspberry-test-run-widget';
import { RaspberryYieldChartWidget } from '../raspberry-yield-chart-widget';
import { RaspberryTestHistoryWidget } from '../raspberry-test-history-widget';
import { RaspberryFailPieChartWidget } from '../raspberry-fail-pie-chart-widget';
import { RaspberryStatusWidget, ConnectionStatus } from '../raspberry-status-widget';

// ----------------------------------------------------------------------

export function RaspberryDashboardView() {
  // 장비 연결 상태 관리를 위한 State
  const [backendStatus, setBackendStatus] = useState<ConnectionStatus>('checking');
  const [piAStatus, setPiAStatus] = useState<ConnectionStatus>('checking');
  const [piBStatus, setPiBStatus] = useState<ConnectionStatus>('checking');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const { ipAddress, handleIpChange } = useRaspberryIp();

  // 추후 API 또는 WebSocket을 통해 연결 상태를 받아오는 로직을 여기에 구현합니다.
  // 현재는 예시로 1.5초 뒤에 모두 온라인으로 바뀌도록 시뮬레이션 합니다.
  useEffect(() => {
    const timer = setTimeout(() => {
      setBackendStatus('ready');
      setPiAStatus('ready');
      setPiBStatus('ready');
      setLastUpdate(new Date());
      setLastResult('PASS'); // 테스트용 임시 결과 데이터
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>RaspberryPi ATE PoC Dashboard</Typography>
        <RaspberryIpSetting ipAddress={ipAddress} onIpChange={handleIpChange} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <RaspberryStatusWidget
          backendStatus={backendStatus}
          piAStatus={piAStatus}
          piBStatus={piBStatus}
          lastUpdate={lastUpdate}
          lastResult={lastResult}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}><TestRunWidget /></Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}><RaspberryYieldChartWidget /><RaspberryFailPieChartWidget /></Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}><RaspberryTestHistoryWidget /></Box>
    </DashboardContent>
  );
}