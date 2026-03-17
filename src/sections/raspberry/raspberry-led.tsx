import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useErrorMessage } from 'src/hooks/error-message';

import { Iconify } from 'src/components/iconify';

import { sendRaspberryCommand } from 'src/sections/raspberry/raspberry-axios';

import { useCommandPolling } from './hooks/command-polling';

type LedItemProps = {
  id: string;
  label: string;
  color: 'error' | 'info';
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ipAddress: string;
};

export function LedItem({ id, label, color, checked, onChange, ipAddress }: LedItemProps) {
  const { isLoading, executeWithPolling } = useCommandPolling();
  const { errorMessage, setErrorMessage, handleCloseError } = useErrorMessage();

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;

    // 상위 컴포넌트의 상태를 즉시 업데이트 (Optimistic Update)
    onChange(event);

    const commandText = `LED ${isChecked ? 'on' : 'off'} ${id}`;

    try {
      await executeWithPolling(() => sendRaspberryCommand(ipAddress, commandText));
    } catch (error: any) {
      console.error('Failed to execute command:', error);
      const message = error.response?.data?.message || error.message || '명령 처리 중 오류가 발생했습니다.';
      setErrorMessage(message);
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
          disabled={isLoading}
          icon={<Iconify width={32} icon="mdi:lightbulb-outline" />}
          checkedIcon={<Iconify width={32} icon="mdi:lightbulb-on" />}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {label}
            {isLoading && <CircularProgress size={16} thickness={5} />}
          </Typography>
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
