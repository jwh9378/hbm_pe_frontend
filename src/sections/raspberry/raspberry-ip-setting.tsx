import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';

type Props = {
  ipAddress: string;
  onIpChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function RaspberryIpSetting({ ipAddress, onIpChange }: Props) {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleApplyIp = useCallback(() => {
    localStorage.setItem('target_device_ip', ipAddress);
    setOpenSnackbar(true);
  }, [ipAddress]);

  const handleCloseSnackbar = useCallback((event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  }, []);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size="small"
          label="RaspberryPi IP Address"
          value={ipAddress}
          onChange={onIpChange}
          placeholder="192.168.0.100"
          sx={{ width: { xs: 200, sm: 240 } }}
        />
        <Button variant="contained" color="inherit" onClick={handleApplyIp} sx={{ height: 40, flexShrink: 0 }}>
          Apply
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled" sx={{ width: '100%' }}>
          라즈베리파이 IP가 {ipAddress}(으)로 설정되었습니다.
        </Alert>
      </Snackbar>
    </>
  );
}