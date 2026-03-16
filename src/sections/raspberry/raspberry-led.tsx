import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

type LedItemProps = {
  label: string;
  color: 'error' | 'info';
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function LedItem({ label, color, checked, onChange }: LedItemProps) {
  return (
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
        onChange={onChange}
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
  );
}
