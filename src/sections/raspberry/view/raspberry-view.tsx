import { useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function RaspberryView() {
  const [redLedOn, setRedLedOn] = useState(false);
  const [blueLedOn, setBlueLedOn] = useState(false);

  const handleRedLedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRedLedOn(event.target.checked);
  }, []);

  const handleBlueLedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setBlueLedOn(event.target.checked);
  }, []);

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
        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: (theme) => theme.transitions.create(['background-color']),
              ...(redLedOn && {
                bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.16),
              }),
            }}
          >
            <Checkbox
              checked={redLedOn}
              onChange={handleRedLedChange}
              color="error"
              icon={<Iconify width={32} icon={"mdi:lightbulb-outline" as any} />}
              checkedIcon={<Iconify width={32} icon={"mdi:lightbulb-on" as any} />}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">Red LED</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {redLedOn ? 'Currently ON' : 'Currently OFF'}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: (theme) => theme.transitions.create(['background-color']),
              ...(blueLedOn && {
                bgcolor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.16),
              }),
            }}
          >
            <Checkbox
              checked={blueLedOn}
              onChange={handleBlueLedChange}
              color="info"
              icon={<Iconify width={32} icon={"mdi:lightbulb-outline" as any} />}
              checkedIcon={<Iconify width={32} icon={"mdi:lightbulb-on" as any} />}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">Blue LED</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {blueLedOn ? 'Currently ON' : 'Currently OFF'}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
