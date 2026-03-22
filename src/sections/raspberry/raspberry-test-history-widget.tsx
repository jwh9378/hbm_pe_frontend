import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';

import { Iconify } from 'src/components/iconify';

const MOCK_HISTORY = [
  { id: 'T-0012', scenario: 'Test Scenario 2 (Advanced)', startTime: '2023-10-28 10:15:00', duration: '4m 55s', status: 'PASS' },
  { id: 'T-0011', scenario: 'Test Scenario 1 (Basic)', startTime: '2023-10-28 09:30:00', duration: '1m 21s', status: 'PASS' },
  { id: 'T-0010', scenario: 'Test Scenario 3 (Full Check)', startTime: '2023-10-28 08:00:00', duration: '14m 45s', status: 'FAIL' },
  { id: 'T-0009', scenario: 'Test Scenario 1 (Basic)', startTime: '2023-10-27 16:45:00', duration: '1m 19s', status: 'PASS' },
  { id: 'T-0008', scenario: 'Test Scenario 2 (Advanced)', startTime: '2023-10-27 15:30:00', duration: '5m 05s', status: 'PASS' },
  { id: 'T-0007', scenario: 'Test Scenario 1 (Basic)', startTime: '2023-10-27 15:00:00', duration: '1m 20s', status: 'PASS' },
  { id: 'T-0006', scenario: 'Test Scenario 3 (Full Check)', startTime: '2023-10-27 14:30:00', duration: '15m 10s', status: 'FAIL' },
  { id: 'T-0005', scenario: 'Test Scenario 1 (Basic)', startTime: '2023-10-27 14:20:00', duration: '1m 20s', status: 'PASS' },
  { id: 'T-0004', scenario: 'Test Scenario 2 (Advanced)', startTime: '2023-10-27 13:45:00', duration: '5m 10s', status: 'FAIL' },
  { id: 'T-0003', scenario: 'Test Scenario 1 (Basic)', startTime: '2023-10-27 11:10:00', duration: '1m 18s', status: 'PASS' },
  { id: 'T-0002', scenario: 'Test Scenario 3 (Full Check)', startTime: '2023-10-27 09:00:00', duration: '15m 30s', status: 'PASS' },
  { id: 'T-0001', scenario: 'Test Scenario 1 (Basic)', startTime: '2023-10-26 16:30:00', duration: '1m 22s', status: 'FAIL' },
];

// MOCK_HISTORY에서 고유한 시나리오 목록 추출
const SCENARIO_OPTIONS = ['All Scenarios', ...Array.from(new Set(MOCK_HISTORY.map((item) => item.scenario)))];
const STATUS_OPTIONS = ['All Status', 'PASS', 'FAIL'];

// Duration 문자열("1m 20s" 등)을 초(seconds) 단위 숫자로 변환하는 헬퍼 함수
function parseDurationToSeconds(duration: string) {
  let totalSeconds = 0;
  const minMatch = duration.match(/(\d+)m/);
  const secMatch = duration.match(/(\d+)s/);
  if (minMatch) totalSeconds += parseInt(minMatch[1], 10) * 60;
  if (secMatch) totalSeconds += parseInt(secMatch[1], 10);
  return totalSeconds;
}

export function RaspberryTestHistoryWidget() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<typeof MOCK_HISTORY[0] | null>(null);
  const [filterScenario, setFilterScenario] = useState(SCENARIO_OPTIONS[0]);
  const [filterDate, setFilterDate] = useState(''); // 날짜 필터용 상태 추가
  const [filterStatus, setFilterStatus] = useState(STATUS_OPTIONS[0]); // 상태 필터용 상태 추가
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>(''); // 정렬 기준 열
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null); // 필터 Popover 기준점

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (row: typeof MOCK_HISTORY[0]) => {
    setSelectedTest(row);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTest(null);
  };

  const handleDownloadLogs = () => {
    if (!selectedTest) return;
    
    const logs = [
      `[SYSTEM] Initializing test sequence for ${selectedTest.id}...`,
      `[SYSTEM] Loading scenario: ${selectedTest.scenario}...`,
      selectedTest.status === 'PASS' ? '[SUCCESS] All checks completed without errors.' : '[ERROR] Validation failed during component checking.',
      `[SYSTEM] Test finalized in ${selectedTest.duration}.`
    ].join('\n');

    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTest.id}_execution_logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterScenario(event.target.value);
    setPage(0); // 필터 변경 시 첫 페이지로 이동
  };

  const handleFilterDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(event.target.value);
    setPage(0); // 날짜 변경 시 첫 페이지로 이동
  };

  const handleFilterStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterStatus(event.target.value);
    setPage(0); // 상태 변경 시 첫 페이지로 이동
  };

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOpenFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleClearFilters = () => {
    setFilterDate('');
    setFilterScenario(SCENARIO_OPTIONS[0]);
    setFilterStatus(STATUS_OPTIONS[0]);
    setPage(0);
  };

  const isFiltered = filterDate !== '' || filterScenario !== SCENARIO_OPTIONS[0] || filterStatus !== STATUS_OPTIONS[0];

  // 선택된 시나리오, 날짜, 상태에 맞게 데이터 필터링
  const filteredHistory = MOCK_HISTORY.filter(
    (row) => 
      (filterScenario === 'All Scenarios' || row.scenario === filterScenario) &&
      (filterDate === '' || row.startTime.startsWith(filterDate)) && // YYYY-MM-DD 형식 비교
      (filterStatus === 'All Status' || row.status === filterStatus) // 상태 비교
  );

  // 필터링된 데이터를 기준으로 정렬 적용
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (orderBy === 'duration') {
      const aSec = parseDurationToSeconds(a.duration);
      const bSec = parseDurationToSeconds(b.duration);
      return order === 'asc' ? aSec - bSec : bSec - aSec;
    }
    if (orderBy === 'startTime') {
      const aTime = new Date(a.startTime).getTime();
      const bTime = new Date(b.startTime).getTime();
      return order === 'asc' ? aTime - bTime : bTime - aTime;
    }
    return 0; // 정렬 기준이 없으면 원래 순서 유지
  });

  // 정렬된 데이터를 기준으로 페이지네이션 자르기
  const paginatedData = sortedHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // 데이터 없음 및 빈 행 계산 (테이블 높이 고정용)
  const notFound = sortedHistory.length === 0;
  const emptyRows = rowsPerPage - paginatedData.length;

  return (
    <Card>
      <CardHeader
        title="Recent Test History"
        action={
          <Tooltip title="Filter list">
            <IconButton onClick={handleOpenFilter} color={isFiltered ? 'primary' : 'default'}>
              <Badge color="error" variant="dot" invisible={!isFiltered}>
                <Iconify icon="mdi:filter-variant" width={24} />
              </Badge>
            </IconButton>
          </Tooltip>
        }
        sx={{ p: 3, pb: 2 }}
      />
      <TableContainer sx={{ overflow: 'unset', px: 2 }}>
        <Box sx={{ minWidth: 800, overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: 'background.neutral', color: 'text.secondary', fontWeight: 'fontWeightSemiBold', borderBottom: 'none' } }}>
                <TableCell sx={{ borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>Test ID</TableCell>
                <TableCell>Scenario</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'startTime'}
                    direction={orderBy === 'startTime' ? order : 'asc'}
                    onClick={() => handleSort('startTime')}
                  >
                    Start Time
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'duration'}
                    direction={orderBy === 'duration' ? order : 'asc'}
                    onClick={() => handleSort('duration')}
                  >
                    Duration
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => handleRowClick(row)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                      {row.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {row.scenario}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {row.startTime}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                      {row.duration}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      icon={<Iconify icon={row.status === 'PASS' ? 'mdi:check-circle' : 'mdi:close-circle'} />}
                      sx={{ 
                        fontWeight: 'fontWeightBold',
                        px: 0.5,
                        bgcolor: alpha(theme.palette[row.status === 'PASS' ? 'success' : 'error'].main, 0.16),
                        color: theme.palette[row.status === 'PASS' ? 'success' : 'error'].dark,
                        border: 'none',
                        '& .MuiChip-icon': { color: theme.palette[row.status === 'PASS' ? 'success' : 'error'].main }
                      }}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}

              {/* 표시할 데이터가 부족할 경우 빈 공간을 채워 테이블 높이 고정 */}
              {emptyRows > 0 && !notFound && (
                <TableRow sx={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={5} />
                </TableRow>
              )}

              {/* 데이터가 아예 없을 때 (No Data) */}
              {notFound && (
                <TableRow sx={{ height: 53 * rowsPerPage }}>
                  <TableCell colSpan={5} align="center">
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      spacing={1.5}
                      sx={{
                        py: 5,
                        px: 3,
                        borderRadius: 2,
                        border: (t) => `1px dashed ${t.palette.divider}`,
                        color: 'text.disabled',
                        width: 'max-content',
                        mx: 'auto',
                      }}
                    >
                      <Iconify icon="mdi:clipboard-text-off-outline" width={40} />
                      <Typography variant="body2">No Data</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>

      {/* 테이블 하단 페이지네이션 컴포넌트 추가 */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredHistory.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* 필터 Popover (버튼 클릭 시 나타남) */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilter}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { p: 2.5, width: 280, display: 'flex', flexDirection: 'column', gap: 2.5 },
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'fontWeightBold' }}>Filters</Typography>

        <TextField
          select
          label="Scenario"
          size="small"
          value={filterScenario}
          onChange={handleFilterChange}
          fullWidth
        >
          {SCENARIO_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Start Date"
          InputLabelProps={{ shrink: true }}
          size="small"
          value={filterDate}
          onChange={handleFilterDateChange}
          fullWidth
        />

        <TextField
          select
          label="Status"
          size="small"
          value={filterStatus}
          onChange={handleFilterStatusChange}
          fullWidth
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        {isFiltered && (
          <Button
            color="error"
            variant="outlined"
            onClick={handleClearFilters}
            startIcon={<Iconify icon="mdi:filter-off-outline" />}
            fullWidth
          >
            Clear Filters
          </Button>
        )}
      </Popover>

      {/* 테스트 상세 결과를 보여주는 Dialog (모달) */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedTest && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Iconify icon="mdi:clipboard-text-search-outline" width={24} sx={{ color: 'text.secondary' }} />
                </Box>
                <Box>
                  <Typography variant="h6">Test Details</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedTest.id}</Typography>
                </Box>
              </Stack>
              <Chip
                label={selectedTest.status}
                size="small"
                icon={<Iconify icon={selectedTest.status === 'PASS' ? 'mdi:check-circle' : 'mdi:close-circle'} />}
                sx={{
                  fontWeight: 'fontWeightBold',
                  px: 0.5,
                  bgcolor: alpha(theme.palette[selectedTest.status === 'PASS' ? 'success' : 'error'].main, 0.16),
                  color: theme.palette[selectedTest.status === 'PASS' ? 'success' : 'error'].dark,
                  border: 'none',
                  '& .MuiChip-icon': { color: theme.palette[selectedTest.status === 'PASS' ? 'success' : 'error'].main }
                }}
                variant="outlined"
              />
            </DialogTitle>
            
            <DialogContent dividers sx={{ pt: 3, pb: 4, px: 3 }}>
              <Stack spacing={3}>
                {/* 메타 정보 Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2.5, p: 2.5, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Box sx={{ gridColumn: 'span 2' }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Scenario</Typography>
                    <Typography variant="subtitle2">{selectedTest.scenario}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Start Time</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>{selectedTest.startTime}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Duration</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'fontWeightMedium' }}>{selectedTest.duration}</Typography>
                  </Box>
                </Box>
                
                {/* 로그 영역 (터미널 스타일) */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="mdi:console" width={18} /> Execution Logs
                  </Typography>
                  <Box sx={{ p: 2.5, bgcolor: '#1C252E', color: '#A6B0BB', borderRadius: 1.5, fontFamily: 'monospace', fontSize: '0.8125rem', lineHeight: 1.6, overflowX: 'auto' }}>
                    <Box sx={{ color: theme.palette.success.main, mb: 1 }}>$ init_test {selectedTest.id}</Box>
                    <div>[SYSTEM] Initializing test sequence...</div>
                    <div>[SYSTEM] Loading scenario: {selectedTest.scenario}...</div>
                    <Box sx={{ color: selectedTest.status === 'PASS' ? theme.palette.success.main : theme.palette.error.main, my: 1 }}>
                      {selectedTest.status === 'PASS' ? '>[SUCCESS] All checks completed without errors.' : '>[ERROR] Validation failed during component checking.'}
                    </Box>
                    <div>[SYSTEM] Test finalized in {selectedTest.duration}.</div>
                  </Box>
                </Box>
              </Stack>
            </DialogContent>
          </>
        )}

        <DialogActions>
          <Button
            onClick={handleDownloadLogs}
            startIcon={<Iconify icon="mdi:download" />}
          >
            Download Logs
          </Button>
          <Button onClick={handleCloseDialog} variant="contained" color="inherit">Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}