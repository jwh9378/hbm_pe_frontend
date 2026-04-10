import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ATE 테스트 결과 임시 모킹 데이터 (Pass/Fail)
const MOCK_YIELD_DATA = [
  { day: 'Sun', pass: 20, fail: 0 },
  { day: 'Mon', pass: 120, fail: 5 },
  { day: 'Tue', pass: 132, fail: 8 },
  { day: 'Wed', pass: 101, fail: 2 },
  { day: 'Thu', pass: 134, fail: 15 },
  { day: 'Fri', pass: 90, fail: 4 },
  { day: 'Sat', pass: 45, fail: 1 },
];

export function RaspberryYieldChartWidget() {
  const theme = useTheme();

  // 차트 비율 계산을 위한 최대 합계 도출
  const maxTotal = Math.max(...MOCK_YIELD_DATA.map((d) => d.pass + d.fail));

  return (
    <Card>
      <Box sx={{ px: 1.5, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1">Weekly Test Results</Typography>
        <Stack direction="row" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={0.5}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} /><Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Pass</Typography></Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} /><Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Fail</Typography></Stack>
        </Stack>
      </Box>
      
      <Box sx={{ px: 1.5, pb: 1.5 }} dir="ltr">
        <Box sx={{ position: 'relative', height: 218 }}>
          <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ height: '100%' }}>
            {MOCK_YIELD_DATA.map((item, index) => {
              const passHeight = (item.pass / maxTotal) * 100;
              const failHeight = (item.fail / maxTotal) * 100;

              return (
                <Tooltip key={item.day} title={`Pass: ${item.pass} / Fail: ${item.fail}`} arrow placement="top">
                  <Stack alignItems="center" spacing={0.5} sx={{ width: '10%', cursor: 'pointer', '&:hover .bar': { opacity: 0.8 } }}>
                    <Stack
                      justifyContent="flex-end"
                      sx={{
                        height: 160,
                        width: '100%',
                        position: 'relative',
                        transformOrigin: 'bottom', // 바닥을 기준으로 커지도록 설정
                        transform: 'scaleY(0)', // 애니메이션 시작 전 높이 0으로 숨김
                        animation: 'growUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                        animationDelay: `${index * 0.1}s`, // 왼쪽부터 순차적으로 자라남
                        '@keyframes growUp': {
                          '0%': { transform: 'scaleY(0)' },
                          '100%': { transform: 'scaleY(1)' },
                        },
                      }}
                    >
                      <Box
                        className="bar"
                        sx={{
                          width: '100%',
                          height: `${failHeight}%`,
                          bgcolor: 'error.main',
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4,
                          borderBottomLeftRadius: passHeight === 0 ? 4 : 0,
                          borderBottomRightRadius: passHeight === 0 ? 4 : 0,
                          transition: 'opacity 0.2s ease',
                        }}
                      />
                      <Box
                        className="bar"
                        sx={{
                          width: '100%',
                          height: `${passHeight}%`,
                          bgcolor: 'success.main',
                          borderTopLeftRadius: failHeight === 0 ? 4 : 0,
                          borderTopRightRadius: failHeight === 0 ? 4 : 0,
                          borderBottomLeftRadius: 4,
                          borderBottomRightRadius: 4,
                          transition: 'opacity 0.2s ease',
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>{item.day}</Typography>
                  </Stack>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}