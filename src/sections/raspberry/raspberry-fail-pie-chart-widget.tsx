import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// 자주 실패하는 테스트 임시 데이터
const MOCK_FAIL_DATA = [
  { id: 'T-03', label: 'Full Check', count: 45, color: '#FF5630' },
  { id: 'T-02', label: 'Advanced Check', count: 25, color: '#FFAB00' },
  { id: 'T-01', label: 'Basic Check', count: 15, color: '#00B8D9' },
  { id: 'T-04', label: 'Quick Run', count: 5, color: '#8E33FF' },
];

export function RaspberryFailPieChartWidget() {
  const theme = useTheme();
  const total = MOCK_FAIL_DATA.reduce((acc, item) => acc + item.count, 0);

  // 원 차트(도넛)를 그리기 위한 conic-gradient 비율 계산
  let accumulatedPercent = 0;
  const gradientStops = MOCK_FAIL_DATA.map((item) => {
    const percent = (item.count / total) * 100;
    const start = accumulatedPercent;
    accumulatedPercent += percent;
    return `${item.color} ${start}% ${accumulatedPercent}%`;
  });
  const conicGradient = `conic-gradient(${gradientStops.join(', ')})`;

  return (
    <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
      {/* 도넛 차트 영역 */}
      <Box
        sx={{ width: 90, height: 90, borderRadius: '50%', background: conicGradient, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* 도넛 차트의 중앙 빈 공간 */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>{total}</Typography>
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', mt: 0.2 }}>Total</Typography>
        </Box>
      </Box>

      {/* 범례 및 통계 목록 영역 */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Frequent Failures</Typography>
        <Stack spacing={1}>
          {MOCK_FAIL_DATA.map((item) => {
            const percent = ((item.count / total) * 100).toFixed(1);
            
            return (
              <Tooltip key={item.id} title={`${percent}%`} arrow placement="top">
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                  </Stack>
                  <Typography variant="caption" fontWeight="bold">{item.count} Fails</Typography>
                </Stack>
              </Tooltip>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
}