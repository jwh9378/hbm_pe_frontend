import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import {LedItem} from '../raspberry-led';

export function RaspberryView() {
  const [redLedOn, setRedLedOn] = useState(false);
  const [blueLedOn, setBlueLedOn] = useState(false);

  const handleRedLedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRedLedOn(event.target.checked);
  }, []);

  const handleBlueLedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setBlueLedOn(event.target.checked);
  }, []);

  const ledConfigs = [
    {
      id: 'red',
      label: 'Red LED',
      color: 'error' as const,
      checked: redLedOn,
      onChange: handleRedLedChange,
    },
    {
      id: 'blue',
      label: 'Blue LED',
      color: 'info' as const,
      checked: blueLedOn,
      onChange: handleBlueLedChange,
    },
  ];

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Raspberry Pi Test
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {ledConfigs.map((led) => (
          <Grid key={led.id} size={{ xs: 12, md: 3 }}>
            <LedItem
              label={led.label}
              color={led.color}
              checked={led.checked}
              onChange={led.onChange}
            />
          </Grid>
        ))}
      </Grid>
    </DashboardContent>
  );
}
