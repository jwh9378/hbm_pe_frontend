import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';

type Props = {
  inputIp: string;
  onIpChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onApplyIp: () => void;
};

export function RaspberryIpSetting({ inputIp, onIpChange, onApplyIp }: Props) {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleApplyIp = useCallback(() => {
    onApplyIp(); // 부모로부터 전달받은 훅의 apply 액션 실행
    setOpenSnackbar(true);
  }, [onApplyIp]);

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
          value={inputIp}
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
          라즈베리파이 IP가 {inputIp}(으)로 설정되었습니다.
        </Alert>
      </Snackbar>
    </>
  );
}