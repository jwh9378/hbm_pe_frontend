import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { Iconify } from 'src/components/iconify';

const MOCK_SCENARIOS = [
  { value: 'scenario_1', label: 'Test Scenario 1 (Basic)' },
  { value: 'scenario_2', label: 'Test Scenario 2 (Advanced)' },
  { value: 'scenario_3', label: 'Test Scenario 3 (Full Check)' },
];

export function TestRunWidget() {
  const [selectedScenario, setSelectedScenario] = useState(MOCK_SCENARIOS[0].value);
  const [isRunning, setIsRunning] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [runningTest, setRunningTest] = useState<{ value: string; label: string } | null>(null);

  // 임시 대기열 데이터
  const [queue, setQueue] = useState([
    { id: 'REQ-0001', name: 'Test Scenario 2 (Advanced)', value: 'scenario_2', createdAt: new Date() },
    { id: 'REQ-0002', name: 'Test Scenario 3 (Full Check)', value: 'scenario_3', createdAt: new Date() },
  ]);

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = () => {
    const scenario = MOCK_SCENARIOS.find((s) => s.value === selectedScenario);
    if (scenario) {
      setRunningTest(scenario);
    }
    setElapsedTime(0);
    setIsRunning(true);
    // TODO: 백엔드에 테스트 시작 명령 전송
  };

  const processNextInQueue = () => {
    if (queue.length > 0) {
      const nextTest = queue[0];
      setRunningTest({ value: nextTest.value, label: nextTest.name });
      setQueue((prev) => prev.slice(1)); // 대기열 맨 앞 항목 제거
      setElapsedTime(0);
      setIsRunning(true);
      // TODO: 백엔드에 다음 테스트 시작 명령 전송
    } else {
      setIsRunning(false);
      setRunningTest(null);
    }
  };

  const handleStop = () => {
    // TODO: 백엔드에 테스트 정지 명령 전송
    processNextInQueue();
  };

  const handleCancel = () => {
    setConfirmCancelOpen(true);
  };

  const handleConfirmCancel = () => {
    setConfirmCancelOpen(false);
    // TODO: 백엔드에 테스트 취소 명령 전송
    processNextInQueue();
  };

  const handleAddQueue = () => {
    const scenario = MOCK_SCENARIOS.find((s) => s.value === selectedScenario);
    if (scenario) {
      const newId = `REQ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      setQueue((prev) => [...prev, { id: newId, name: scenario.label, value: scenario.value, createdAt: new Date() }]);
    }
  };

  const handleRemoveQueue = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Card>
      <CardHeader title="Test Run"/>
      <CardContent>
        <Stack spacing={1.5}>
          {/* 상단 컨트롤 영역: 드랍다운 및 시작/중지 버튼 */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <TextField
              select
              id="test-scenario-select"
              label="Test Scenario"
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              sx={{ width: { xs: '100%', sm: 220 } }}
              size="small"
            >
              {MOCK_SCENARIOS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              color="inherit"
              onClick={handleAddQueue}
              startIcon={<Iconify icon="mdi:playlist-plus" />}
              sx={{ flexShrink: 0, height: 40 }}
            >
              Add to Queue
            </Button>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* 중단: 현재 실행 중인 테스트 영역 */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'fontWeightSemiBold', mb: 0.5 }}>
              Currently Running Test
            </Typography>
            <Box
              sx={{
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                border: (theme) => `solid 1px ${theme.palette.divider}`,
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                boxShadow: (theme) => theme.customShadows?.z1 || 1,
              }}
            >
              {isRunning && (
                <LinearProgress color="primary" sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2 }} />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 0.5 }}>
                <Iconify
                  icon={isRunning ? "mdi:speedometer" : "mdi:sleep"}
                  width={24}
                  sx={{ color: isRunning ? 'primary.main' : 'text.disabled' }}
                />
                <Box>
                  <Typography variant="subtitle2" color={isRunning ? 'text.primary' : 'text.disabled'}>
                    {isRunning && runningTest
                      ? runningTest.label
                      : 'No test is currently running'}
                  </Typography>
                </Box>
              </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {isRunning && (
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'text.secondary', px: 1 }}>
                {formatTime(elapsedTime)}
              </Typography>
            )}
            {isRunning && (
              <IconButton color="error" onClick={handleCancel} title="Cancel Test">
                <Iconify icon="mdi:trash-can-outline" />
              </IconButton>
            )}
            <Button
              size="small"
              variant="contained"
              color={isRunning ? 'error' : 'primary'}
              onClick={isRunning ? handleStop : handleStart}
              startIcon={<Iconify icon={isRunning ? "mdi:stop-circle-outline" : "mdi:play-circle-outline"} />}
              sx={{ flexShrink: 0, height: 32 }}
            >
              {isRunning ? 'Stop' : 'Start'}
            </Button>
          </Stack>
            </Box>
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* 하단 대기 목록 영역 */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                Pending Tests
              </Typography>
              <Chip label={`${queue.length} in test queue`} size="small" color={queue.length > 0 ? 'info' : 'default'} />
            </Stack>

            <List
              disablePadding
              sx={{
                height: 200,
                overflowY: 'auto',
                pr: 1, // 스크롤바 영역 확보
              }}
            >
              {queue.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.disabled',
                  }}
                >
                  <Iconify icon="mdi:clipboard-text-off-outline" width={40} sx={{ mb: 1 }} />
                  <Typography variant="body2">No pending tests in queue</Typography>
                </Box>
              ) : (
                queue.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    bgcolor: 'background.paper',
                    border: (theme) => `solid 1px ${theme.palette.divider}`,
                    borderRadius: 1.5,
                    mb: 0.5,
                    px: 2,
                    py: 0,
                    boxShadow: (theme) => theme.customShadows?.z1 || 1,
                  }}
                  secondaryAction={
                    <IconButton edge="end" color="error" onClick={() => handleRemoveQueue(item.id)}>
                      <Iconify icon="mdi:trash-can-outline" />
                    </IconButton>
                  }
                >
                  <Box sx={{ mr: 2, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                    <Iconify icon="mdi:clipboard-text-outline" width={28} />
                  </Box>
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{ typography: 'subtitle2' }}
                    secondaryTypographyProps={{ component: 'div' }}
                    secondary={
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {item.id}
                        </Typography>
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {`${item.createdAt.toLocaleDateString()} ${item.createdAt.toLocaleTimeString()}`}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
                ))
              )}
            </List>
          </Box>
        </Stack>
      </CardContent>

      <Dialog open={confirmCancelOpen} onClose={() => setConfirmCancelOpen(false)}>
        <DialogTitle>Cancel Test</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel the currently running test?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancelOpen(false)} color="inherit">
            No
          </Button>
          <Button onClick={handleConfirmCancel} color="error" variant="contained" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}