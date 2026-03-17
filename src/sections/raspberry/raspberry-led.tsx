import { useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { sendRaspberryCommand } from 'src/sections/raspberry/raspberry-axios';

type LedItemProps = {
  id: string;
  label: string;
  color: 'error' | 'info';
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ipAddress: string;
};

export function LedItem({ id, label, color, checked, onChange, ipAddress }: LedItemProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCloseError = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrorMessage(null);
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;

    // 상위 컴포넌트의 상태를 즉시 업데이트 (Optimistic Update)
    onChange(event);

    try {
      const commandText = `LED ${isChecked ? 'on' : 'off'} ${id}`;
      await sendRaspberryCommand(ipAddress, commandText);
    } catch (error: any) {
      console.error('Error sending command:', error);

      // 1. Axios 에러 객체에서 백엔드가 보낸 message 추출 (없으면 기본 메시지 표시)
      const backendMessage = error.response?.data?.message || '요청 처리 중 오류가 발생했습니다.';
      setErrorMessage(backendMessage);

      // 2. 에러가 발생했으므로 토글 UI 상태를 원래대로 롤백
      onChange({ target: { checked: !isChecked } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <>
      <Card
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          transition: (theme) => theme.transitions.create(['background-color']),
          ...(checked && {
            bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.16),
          }),
        }}
      >
        <Checkbox
          checked={checked}
          onChange={handleChange}
          color={color}
          icon={<Iconify width={32} icon="mdi:lightbulb-outline" />}
          checkedIcon={<Iconify width={32} icon="mdi:lightbulb-on" />}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1">{label}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {checked ? 'Currently ON' : 'Currently OFF'}
          </Typography>
        </Box>
      </Card>

      <Snackbar
        open={!!errorMessage} // errorMessage에 값이 있으면 true
        autoHideDuration={4000} // 4초 후 자동 닫힘
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
