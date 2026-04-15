import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { fetchRecentStatusHistory } from './hooks/use-raspberry-axios';

interface Props {
  ipAddress: string;
}

export function RaspberryYieldChartWidget({ ipAddress }: Props) {
  const theme = useTheme();

  const [chartData, setChartData] = useState<any[]>([]);

  const fetchChartData = useCallback(async () => {
    if (!ipAddress) return;
    try {
      const response = await fetchRecentStatusHistory(ipAddress);
      const items = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

      // API 응답 데이터를 그대로 사용하며 날짜 형식만 MM/DD로 변환
      const formattedData = items.map((item: any) => {
        const dateParts = item.date ? item.date.split('-') : [];
        const shortDate = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}` : item.date || 'N/A';

        return {
          fullDate: item.date,
          date: shortDate,
          completed: item.COMPLETED ?? item.completed ?? 0,
          aborted: item.ABORTED ?? item.aborted ?? 0,
          error: item.ERROR ?? item.error ?? 0,
        };
      });

      setChartData(formattedData);
    } catch (error) {
      console.error('Failed to fetch recent status history:', error);
    }
  }, [ipAddress]);

  useEffect(() => {
    fetchChartData();

    // 커스텀 이벤트를 감지하여 차트 데이터를 새로고침
    window.addEventListener('raspberry-history-update', fetchChartData);
    return () => {
      window.removeEventListener('raspberry-history-update', fetchChartData);
    };
  }, [fetchChartData]);

  // 차트 비율 계산을 위한 최대 합계 도출 (0으로 나누는 것을 방지하기 위해 최소값 1 설정)
  const maxTotal = Math.max(1, ...chartData.map((d) => d.completed + d.aborted + d.error));

  return (
    <Card>
      <Box sx={{ px: 1.5, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1">Recent Statuses</Typography>
        {chartData.length > 0 && (
          <Stack direction="row" spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={0.5}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} /><Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Completed</Typography></Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} /><Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Aborted</Typography></Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} /><Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Error</Typography></Stack>
          </Stack>
        )}
      </Box>

      {chartData.length > 0 ? (
        <Box sx={{ px: 1.5, pb: 1.5 }} dir="ltr">
          <Box sx={{ position: 'relative', height: 218 }}>
            <Stack direction="row" alignItems="flex-end" justifyContent="space-evenly" sx={{ height: '100%', gap: 1 }}>
              {chartData.map((item, index) => {
                const completedHeight = (item.completed / maxTotal) * 100;
                const abortedHeight = (item.aborted / maxTotal) * 100;
                const errorHeight = (item.error / maxTotal) * 100;

                return (
                  <Tooltip key={item.date} title={`Completed: ${item.completed} / Aborted: ${item.aborted} / Error: ${item.error}`} arrow placement="top">
                    <Stack alignItems="center" spacing={0.5} sx={{ flex: 1, maxWidth: 48, cursor: 'pointer', '&:hover .bar': { opacity: 0.8 } }}>
                      <Stack
                        justifyContent="flex-end"
                        sx={{
                          height: 160,
                          width: '100%',
                          position: 'relative',
                          borderRadius: 1, // 스택 자체에 radius와 hidden을 주어 자식 요소의 복잡한 모서리 반경 계산을 대체
                          overflow: 'hidden',
                          transformOrigin: 'bottom', // 바닥을 기준으로 커지도록 설정
                          transform: 'scaleY(0)', // 애니메이션 시작 전 높이 0으로 숨김
                          animation: 'growUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                          animationDelay: `${index * 0.05}s`, // 항목 개수에 맞춰 애니메이션 대기 시간 조정
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
                            height: `${errorHeight}%`,
                            bgcolor: 'error.main',
                            transition: 'opacity 0.2s ease',
                          }}
                        />
                        <Box
                          className="bar"
                          sx={{
                            width: '100%',
                            height: `${abortedHeight}%`,
                            bgcolor: 'warning.main',
                            transition: 'opacity 0.2s ease',
                          }}
                        />
                        <Box
                          className="bar"
                          sx={{
                            width: '100%',
                            height: `${completedHeight}%`,
                            bgcolor: 'success.main',
                            transition: 'opacity 0.2s ease',
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem', letterSpacing: -0.5 }}>{item.date}</Typography>
                    </Stack>
                  </Tooltip>
                );
              })}
            </Stack>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 218, color: 'text.disabled', pb: 1.5 }}>
          <Stack alignItems="center" spacing={1}>
            <Iconify icon="mdi:bar-chart" width={40} />
            <Typography variant="body2">No status data available</Typography>
          </Stack>
        </Box>
      )}
    </Card>
  );
}