import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export type ConnectionStatus = 'ready' | 'not ready';

interface Props {
  backendStatus: ConnectionStatus;
  piAStatus: ConnectionStatus;
  piBStatus: ConnectionStatus;
  lastResult?: string | null;
  lastUpdate: Date | null;
}

// 상태에 따른 색상 매핑
const getStatusColor = (status: ConnectionStatus) => {
  switch (status) {
    case 'ready': return 'success.main';
    case 'not ready': return 'error.main';
    default: return 'text.disabled';
  }
};

export function RaspberryStatusWidget({ backendStatus, piAStatus, piBStatus, lastUpdate, lastResult }: Props) {
  // 개별 상태 항목 렌더링 헬퍼
  const renderStatusItem = (label: string, status: ConnectionStatus) => {
    const statusColorKey = status === 'ready' ? 'success' : status === 'not ready' ? 'error' : 'warning';

    return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      {/* 세련된 더블 서클 형태의 상태 점 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: (theme) => alpha(theme.palette[statusColorKey].main, 0.16),
        }}
      >
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: getStatusColor(status) }} />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.2 }}>
          {label}
        </Typography>
        <Typography variant="subtitle2">
          {status.toUpperCase()}
        </Typography>
      </Box>
    </Stack>
    );
  };

  return (
    <Card sx={{ p: 1 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed', display: { xs: 'none', md: 'block' } }} />}
        spacing={3}
      >
        {/* 왼쪽: 장비 연결 상태 그룹 */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 4, md: 12 }}
          flexGrow={1}
          sx={{pl: {xs: 1, sm: 3, md: 3}}}
        >
          {renderStatusItem('Backend Server', backendStatus)}
          {renderStatusItem('Raspberry Pi A (Bridge)', piAStatus)}
          {renderStatusItem('Raspberry Pi B (ATE)', piBStatus)}
        </Stack>

        {/* 모바일 화면용 가로 구분선 */}
        <Divider sx={{ borderStyle: 'dashed', display: { xs: 'block', md: 'none' }, my: 1 }} />

        {/* 오른쪽: 메타 정보 그룹 (결과, 업데이트 시간) */}
        <Stack direction="row" spacing={5} alignItems="center" minWidth={{ md: 250 }} justifyContent={{ xs: 'space-between', md: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Last Result</Typography>
            <Chip
              label={lastResult || 'N/A'}
              color={lastResult === 'PASS' ? 'success' : lastResult === 'FAIL' ? 'error' : 'default'}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Updated</Typography>
            <Typography variant="subtitle2">
              {lastUpdate ? lastUpdate.toLocaleString() : 'N/A'}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
}