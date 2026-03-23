import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { useRaspberryIp } from '../hooks/use-raspberry-ip';
import { RaspberryIpSetting } from '../raspberry-ip-setting';
import { TestRunWidget } from '../raspberry-test-run-widget';
import { RaspberryStatusWidget } from '../raspberry-status-widget';
import { useRaspberryStatus } from '../hooks/use-raspberry-status';
import { RaspberryYieldChartWidget } from '../raspberry-yield-chart-widget';
import { RaspberryTestHistoryWidget } from '../raspberry-test-history-widget';
import { RaspberryFailPieChartWidget } from '../raspberry-fail-pie-chart-widget';

// ----------------------------------------------------------------------

export function RaspberryDashboardView() {
  const { ipAddress, inputIp, handleIpChange, handleApplyIp } = useRaspberryIp();
  const { backendStatus, piAStatus, piBStatus, lastUpdate, lastResult } = useRaspberryStatus(ipAddress);

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
          RaspberryPi ATE PoC Dashboard
        </Typography>

        <RaspberryIpSetting 
          inputIp={inputIp} 
          onIpChange={handleIpChange} 
          onApplyIp={handleApplyIp} 
        />
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
        <Grid size={{ xs: 12, md: 7 }}>
          <TestRunWidget />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            <RaspberryYieldChartWidget />
            <RaspberryFailPieChartWidget />
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <RaspberryTestHistoryWidget />
      </Box>
    </DashboardContent>
  );
}