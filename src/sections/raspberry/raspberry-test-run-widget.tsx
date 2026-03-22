import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';

const MOCK_SCENARIOS = [
  { value: 'scenario_1', label: 'Test Scenario 1 (Basic)' },
  { value: 'scenario_2', label: 'Test Scenario 2 (Advanced)' },
  { value: 'scenario_3', label: 'Test Scenario 3 (Full Check)' },
];

export function TestRunWidget() {
  const [selectedScenario, setSelectedScenario] = useState(MOCK_SCENARIOS[0].value);
  const [isRunning, setIsRunning] = useState(false);

  // 임시 대기열 데이터
  const [queue, setQueue] = useState([
    { id: 'REQ-0001', name: 'Test Scenario 2 (Advanced)', createdAt: new Date() },
    { id: 'REQ-0002', name: 'Test Scenario 3 (Full Check)', createdAt: new Date() },
  ]);

  const handleStart = () => {
    setIsRunning(true);
    // TODO: 백엔드에 테스트 시작 명령 전송
  };

  const handleStop = () => {
    setIsRunning(false);
    // TODO: 백엔드에 테스트 정지 명령 전송
  };

  const handleAddQueue = () => {
    const scenario = MOCK_SCENARIOS.find((s) => s.value === selectedScenario);
    if (scenario) {
      const newId = `REQ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      setQueue((prev) => [...prev, { id: newId, name: scenario.label, createdAt: new Date() }]);
    }
  };

  const handleRemoveQueue = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Card>
      <CardHeader title="Test Run"/>
      <CardContent>
        <Stack spacing={2}>
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
              variant="contained"
              color={isRunning ? 'error' : 'primary'}
              onClick={isRunning ? handleStop : handleStart}
              startIcon={<Iconify icon={isRunning ? "mdi:stop-circle-outline" : "mdi:play-circle-outline"} />}
              sx={{ flexShrink: 0, height: 40 }}
            >
              {isRunning ? 'Stop' : 'Start'}
            </Button>

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

          {/* 하단 대기 목록 영역 */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                Pending Tests
              </Typography>
              <Chip label={`${queue.length} in test queue`} size="small" color={queue.length > 0 ? 'info' : 'default'} />
            </Stack>

            <List
              disablePadding
              sx={{
                maxHeight: 250, // 아이템 약 4개 높이 분량
                overflowY: 'auto',
                pr: 1, // 스크롤바 영역 확보
              }}
            >
              {queue.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    bgcolor: 'background.paper',
                    border: (theme) => `solid 1px ${theme.palette.divider}`,
                    borderRadius: 1.5,
                    mb: 1,
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
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
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
              ))}
            </List>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}