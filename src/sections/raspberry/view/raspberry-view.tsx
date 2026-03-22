import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import {LedItem} from '../raspberry-led';
import { TestRunWidget } from '../raspberry-test-run-widget';
import { RaspberryStatusWidget, ConnectionStatus } from '../raspberry-status-widget';

// ----------------------------------------------------------------------

const LED_CONFIGS = [
  { id: 'red', label: 'Red LED', color: 'error' as const },
  { id: 'blue', label: 'Blue LED', color: 'info' as const },
];

// ----------------------------------------------------------------------

export function RaspberryView() {
  const [ipAddress, setIpAddress] = useState(
    () => localStorage.getItem('target_device_ip') || '192.168.0.100'
  );

  const [ledStates, setLedStates] = useState<Record<string, boolean>>({
    red: false,
    blue: false,
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);

  // 장비 연결 상태 관리를 위한 State
  const [backendStatus, setBackendStatus] = useState<ConnectionStatus>('checking');
  const [piAStatus, setPiAStatus] = useState<ConnectionStatus>('checking');
  const [piBStatus, setPiBStatus] = useState<ConnectionStatus>('checking');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

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

  const handleLedChange = useCallback(
    (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setLedStates((prev) => ({
        ...prev,
        [id]: event.target.checked,
      }));
    },
    []
  );

  const handleIpChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIpAddress(event.target.value);
  }, []);

  const handleApplyIp = useCallback(() => {
    localStorage.setItem('target_device_ip', ipAddress);
    setOpenSnackbar(true);
  }, [ipAddress]);

  const handleCloseSnackbar = useCallback((event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
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
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Raspberry Pi Test
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            label="RaspberryPi IP Address"
            value={ipAddress}
            onChange={handleIpChange}
            placeholder="192.168.0.100"
            sx={{ width: { xs: 200, sm: 240 } }}
          />
          <Button variant="contained" color="inherit" onClick={handleApplyIp} sx={{ height: 40, flexShrink: 0 }}>
            Apply
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {LED_CONFIGS.map((config) => (
          <Grid key={config.id} size={{ xs: 12, md: 3 }}>
            <LedItem
              id={config.id}
              label={config.label}
              color={config.color}
              checked={ledStates[config.id] || false}
              onChange={handleLedChange(config.id)}
              ipAddress={ipAddress}
            />
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 8,
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          ATE Dashboard
        </Typography>
      </Box>

      {/* 상태 요약 대시보드 위젯 */}
      <Box sx={{ mb: 2 }}>
        <RaspberryStatusWidget
          backendStatus={backendStatus}
          piAStatus={piAStatus}
          piBStatus={piBStatus}
          lastUpdate={lastUpdate}
          lastResult={lastResult}
        />
      </Box>

      {/* 테스트 실행 및 대기 목록 */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TestRunWidget />
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled" sx={{ width: '100%' }}>
          라즈베리파이 IP가 {ipAddress}(으)로 설정되었습니다.
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
