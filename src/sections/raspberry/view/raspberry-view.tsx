import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

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

      <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h6">LED On/Off</Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={redLedOn}
                onChange={handleRedLedChange}
                color="error"
                icon={<Iconify icon={"mdi:lightbulb-outline" as any} />}
                checkedIcon={<Iconify icon={"mdi:lightbulb-on" as any} />}
              />
            }
            label="Red"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={blueLedOn}
                onChange={handleBlueLedChange}
                color="info"
                icon={<Iconify icon={"mdi:lightbulb-outline" as any} />}
                checkedIcon={<Iconify icon={"mdi:lightbulb-on" as any} />}
              />
            }
            label="Blue"
          />
        </Box>
      </Card>
    </DashboardContent>
  );
}
