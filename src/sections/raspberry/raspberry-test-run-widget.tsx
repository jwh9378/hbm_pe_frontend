import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';

import { useTestRun, MOCK_SCENARIOS } from './core/use-raspberry-test-run';

type Props = {
  ipAddress: string;
};

export function TestRunWidget({ ipAddress }: Props) {
  const {
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
  } = useTestRun(ipAddress);

  const totalPendingCount = Math.max(0, totalCount - (isRunning ? 1 : 0));
  const hiddenCount = totalPendingCount - queue.length;

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
                <MenuItem key={option.label} value={option.label}>
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
            <Button
              size="small"
              variant="contained"
              color={isRunning ? 'error' : 'primary'}
              onClick={isRunning ? handleStop : handleStart}
              startIcon={<Iconify icon={isRunning ? "mdi:stop-circle-outline" : "mdi:play-circle-outline"} />}
              sx={{ flexShrink: 0, height: 32 }}
              disabled={!isWsConnected}
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
              <Chip label={`${totalPendingCount} in test queue`} size="small" color={totalPendingCount > 0 ? 'info' : 'default'} />
            </Stack>

            <List
              disablePadding
              sx={{
                height: 200,
                overflowY: 'auto',
                pr: 1, // 스크롤바 영역 확보
              }}
            >
              {totalPendingCount === 0 ? (
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
                <>
                  {queue.map((item) => (
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
                  ))}

                  {hiddenCount > 0 && (
                    <ListItem sx={{ justifyContent: 'center', py: 2 }}>
                      <ListItemText
                        primary="..."
                        secondary={`그 외 ${hiddenCount}개의 대기 항목이 더 있습니다.`}
                        primaryTypographyProps={{ textAlign: 'center', color: 'text.secondary', fontWeight: 'bold' }}
                        secondaryTypographyProps={{ textAlign: 'center' }}
                      />
                    </ListItem>
                  )}
                </>
              )}
            </List>
          </Box>
        </Stack>
      </CardContent>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={4000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
}