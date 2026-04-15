import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { fetchScenarioStats } from './hooks/use-raspberry-axios';

// SVG 도넛 차트 상수
const SIZE = 120;
const STROKE_WIDTH = 22;
const RADIUS = 49;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const FAIL_COLORS = ['#FF5630', '#FFAB00', '#00B8D9', '#8E33FF', '#36B37E'];

interface FailStat {
  id: string;
  label: string;
  count: number;
  color: string;
}

interface Props {
  ipAddress: string;
}

export function RaspberryFailPieChartWidget({ ipAddress }: Props) {
  const theme = useTheme();
  const [failData, setFailData] = useState<FailStat[]>([]);

  const fetchChartData = useCallback(async () => {
    if (!ipAddress) return;
    try {
      const response = await fetchScenarioStats(ipAddress);
      const items = Array.isArray(response) ? response : [];

      const formattedData = items
        .filter((item: any) => item.total_failed > 0)
        .sort((a: any, b: any) => b.total_failed - a.total_failed)
        .slice(0, 4)
        .map((item: any, index: number) => ({
          id: item.name,
          label: item.name,
          count: item.total_failed,
          color: FAIL_COLORS[index % FAIL_COLORS.length],
        }));

      setFailData(formattedData);
    } catch (error) {
      console.error('Failed to fetch scenario stats:', error);
      setFailData([]);
    }
  }, [ipAddress]);

  useEffect(() => {
    fetchChartData();

    window.addEventListener('raspberry-history-update', fetchChartData);
    return () => {
      window.removeEventListener('raspberry-history-update', fetchChartData);
    };
  }, [fetchChartData]);

  const total = failData.reduce((acc, item) => acc + item.count, 0);

  // SVG 도넛 차트 조각 계산
  let accumulatedPercent = 0;
  const slices = failData.map((item) => {
    const percent = (item.count / total) * 100;
    const dashLength = (percent / 100) * CIRCUMFERENCE;
    // 미세한 빈틈 렌더링 방지를 위해 길이에 +1을 더함
    const strokeDasharray = `${dashLength + 1} ${CIRCUMFERENCE}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * CIRCUMFERENCE);
    accumulatedPercent += percent;

    return {
      ...item,
      percent: percent.toFixed(1),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <Card>
      <Box sx={{ px: 2, pt: 2, pb: failData.length > 0 ? 3 : 2 }}>
        <Typography variant="subtitle1">Frequent Failures</Typography>
      </Box>

      {failData.length > 0 ? (
        <Box sx={{ px: 2, pb: 3.5, display: 'flex', alignItems: 'center', gap: 4 }}>
      {/* 도넛 차트 영역 (SVG 기반) */}
      <Box
        sx={{
          position: 'relative',
          width: SIZE,
          height: SIZE,
          flexShrink: 0,
          animation: 'pieChartEntrance 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
          '@keyframes pieChartEntrance': {
            '0%': { opacity: 0, transform: 'scale(0.5) rotate(-45deg)' },
            '100%': { opacity: 1, transform: 'scale(1) rotate(0deg)' },
          },
        }}
      >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          {slices.map((slice) => (
            <Tooltip key={slice.id} title={`${slice.label}: ${slice.count} (${slice.percent}%)`} arrow placement="top">
            <Box
              component="circle"
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={slice.color}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              sx={{
                strokeWidth: STROKE_WIDTH,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  strokeWidth: STROKE_WIDTH + 6,
                  filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))',
                },
              }}
            />
            </Tooltip>
          ))}
        </svg>

        {/* 도넛 차트의 중앙 텍스트 */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h6" sx={{ lineHeight: 1 }}>{total}</Typography>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 0.5 }}>Total</Typography>
        </Box>
      </Box>

      {/* 범례 및 통계 목록 영역 */}
      <Box sx={{ flexGrow: 1 }}>
        <Stack spacing={1.5}>
          {failData.map((item, index) => {
            const percent = ((item.count / total) * 100).toFixed(1);

            return (
              <Tooltip key={item.id} title={`${percent}%`} arrow placement="top">
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    cursor: 'pointer',
                    opacity: 0, // 애니메이션 시작 전 숨김
                    animation: 'fadeInRight 0.5s ease forwards',
                    animationDelay: `${0.2 + index * 0.1}s`, // 항목별로 순차적 등장
                    '@keyframes fadeInRight': {
                      '0%': { opacity: 0, transform: 'translateX(-10px)' },
                      '100%': { opacity: 1, transform: 'translateX(0)' },
                    },
                    '&:hover': { opacity: '0.7 !important' },
                  }}
                >
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
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: 'text.disabled' }}>
          <Stack alignItems="center" spacing={1}>
            <Iconify icon="mdi:chart-arc" width={40} />
            <Typography variant="body2">No failure data available</Typography>
          </Stack>
        </Box>
      )}
    </Card>
  );
}