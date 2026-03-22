import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { LedItem } from '../raspberry-led';
import { useRaspberryIp } from '../hooks/use-raspberry-ip';
import { RaspberryIpSetting } from '../raspberry-ip-setting';

// ----------------------------------------------------------------------

const LED_CONFIGS = [
  { id: 'red', label: 'Red LED', color: 'error' as const },
  { id: 'blue', label: 'Blue LED', color: 'info' as const },
];

// ----------------------------------------------------------------------

export function RaspberryView() {
  const { ipAddress, handleIpChange } = useRaspberryIp();

  const [ledStates, setLedStates] = useState<Record<string, boolean>>({
    red: false,
    blue: false,
  });

  const handleLedChange = useCallback(
    (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setLedStates((prev) => ({
        ...prev,
        [id]: event.target.checked,
      }));
    },
    []
  );

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
          RaspberryPi LED Test
        </Typography>

        <RaspberryIpSetting ipAddress={ipAddress} onIpChange={handleIpChange} />
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
    </DashboardContent>
  );
}
