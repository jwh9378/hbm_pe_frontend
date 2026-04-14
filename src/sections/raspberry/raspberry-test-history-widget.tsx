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

import { useTestHistory, HistoryItem } from './core/use-raspberry-test-history';

interface Props {
  ipAddress: string;
}

export function RaspberryTestHistoryWidget({ ipAddress }: Props) {
  const theme = useTheme();
  
  const {
    isLoading,
    paginatedData,
    totalFilteredCount,
    scenarioOptions,
    statusOptions,
    page,
    setPage,
    rowsPerPage,
    filterScenario,
    setFilterScenario,
    filterDate,
    setFilterDate,
    filterStatus,
    setFilterStatus,
    order,
    orderBy,
    handleClearFilters,
    handleSort,
    handleChangePage,
    handleChangeRowsPerPage,
    isFiltered,
    fetchHistory,
  } = useTestHistory(ipAddress);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<HistoryItem | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null); // 필터 Popover 기준점

  const handleRowClick = (row: HistoryItem) => {
    setSelectedTest(row);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTest(null);
  };

  const handleDownloadLogs = () => {
    if (!selectedTest) return;
    
    const logMessage = selectedTest.status === 'COMPLETED'
      ? '[SUCCESS] All checks completed without errors.'
      : selectedTest.status === 'ABORTED'
      ? '[WARNING] Test aborted.'
      : '[ERROR] Validation failed during component checking.';

    const logs = [
      `[SYSTEM] Initializing test sequence for ${selectedTest.id}...`,
      `[SYSTEM] Loading scenario: ${selectedTest.scenario}...`,
      `[INFO] Test Cases - Passed: ${selectedTest.status === 'COMPLETED' ? selectedTest.passedCount : '-'}, Failed: ${selectedTest.status === 'COMPLETED' ? selectedTest.failedCount : '-'}`,
      logMessage,
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

  const handleReRun = () => {
    if (!selectedTest) return;
    // TestRunWidget으로 시나리오를 전달하여 Pending Queue에 추가하도록 이벤트 발생
    window.dispatchEvent(new CustomEvent('request-rerun', { detail: selectedTest.scenario }));
    handleCloseDialog();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 상단 Test Run 화면으로 스크롤 이동
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

  const handleOpenFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  // 데이터 없음 및 빈 행 계산 (테이블 높이 고정용)
  const notFound = paginatedData.length === 0;
  const emptyRows = rowsPerPage - paginatedData.length;

  return (
    <Card>
      <CardHeader
        title="Recent Test History"
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <span>
                <IconButton onClick={fetchHistory} disabled={isLoading}>
                  <Iconify
                    icon={isLoading ? 'mdi:loading' : 'mdi:refresh'}
                    width={24}
                    sx={isLoading ? { animation: 'spin 1s linear infinite', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } } : {}}
                  />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Filter list">
              <IconButton onClick={handleOpenFilter} color={isFiltered ? 'primary' : 'default'}>
                <Badge color="error" variant="dot" invisible={!isFiltered}>
                  <Iconify icon="mdi:filter-variant" width={24} />
                </Badge>
              </IconButton>
            </Tooltip>
          </Stack>
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
                <TableCell>Test Cases</TableCell>
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
                    {row.status === 'COMPLETED' ? (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 'fontWeightMedium' }}>{row.passedCount}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Pass</Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ mx: 0.5 }}>/</Typography>
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 'fontWeightMedium' }}>{row.failedCount}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Fail</Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                    icon={<Iconify icon={row.status === 'COMPLETED' ? 'mdi:check-circle' : row.status === 'ABORTED' ? 'mdi:stop-circle' : 'mdi:close-circle'} />}
                      sx={{
                        fontWeight: 'fontWeightBold',
                        px: 0.5,
                      bgcolor: alpha(theme.palette[row.status === 'COMPLETED' ? 'success' : row.status === 'ABORTED' ? 'warning' : 'error'].main, 0.16),
                      color: theme.palette[row.status === 'COMPLETED' ? 'success' : row.status === 'ABORTED' ? 'warning' : 'error'].dark,
                        border: 'none',
                      '& .MuiChip-icon': { color: theme.palette[row.status === 'COMPLETED' ? 'success' : row.status === 'ABORTED' ? 'warning' : 'error'].main }
                      }}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}

              {/* 표시할 데이터가 부족할 경우 빈 공간을 채워 테이블 높이 고정 */}
              {emptyRows > 0 && !notFound && (
                <TableRow sx={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}

              {/* 데이터가 아예 없을 때 (No Data) */}
              {notFound && (
                <TableRow sx={{ height: 53 * rowsPerPage }}>
                  <TableCell colSpan={6} align="center">
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
        count={totalFilteredCount}
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
          {scenarioOptions.map((option) => (
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
          {statusOptions.map((option) => (
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
                icon={<Iconify icon={selectedTest.status === 'COMPLETED' ? 'mdi:check-circle' : selectedTest.status === 'ABORTED' ? 'mdi:stop-circle' : 'mdi:close-circle'} />}
                sx={{
                  fontWeight: 'fontWeightBold',
                  px: 0.5,
                  bgcolor: alpha(theme.palette[selectedTest.status === 'COMPLETED' ? 'success' : selectedTest.status === 'ABORTED' ? 'warning' : 'error'].main, 0.16),
                  color: theme.palette[selectedTest.status === 'COMPLETED' ? 'success' : selectedTest.status === 'ABORTED' ? 'warning' : 'error'].dark,
                  border: 'none',
                  '& .MuiChip-icon': { color: theme.palette[selectedTest.status === 'COMPLETED' ? 'success' : selectedTest.status === 'ABORTED' ? 'warning' : 'error'].main }
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
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Passed</Typography>
                    <Typography variant="body2" color={selectedTest.status === 'COMPLETED' ? "success.main" : "text.secondary"} sx={{ fontWeight: 'fontWeightBold' }}>{selectedTest.status === 'COMPLETED' ? selectedTest.passedCount : '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Failed</Typography>
                    <Typography variant="body2" color={selectedTest.status === 'COMPLETED' ? "error.main" : "text.secondary"} sx={{ fontWeight: 'fontWeightBold' }}>{selectedTest.status === 'COMPLETED' ? selectedTest.failedCount : '-'}</Typography>
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
                    <div>[INFO] Test Cases - Passed: {selectedTest.status === 'COMPLETED' ? selectedTest.passedCount : '-'}, Failed: {selectedTest.status === 'COMPLETED' ? selectedTest.failedCount : '-'}</div>
                  <Box sx={{ color: selectedTest.status === 'COMPLETED' ? theme.palette.success.main : selectedTest.status === 'ABORTED' ? theme.palette.warning.main : theme.palette.error.main, my: 1 }}>
                    {selectedTest.status === 'COMPLETED' ? '>[SUCCESS] All checks completed without errors.' : selectedTest.status === 'ABORTED' ? '>[WARNING] Test aborted.' : '>[ERROR] Validation failed during component checking.'}
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
            onClick={handleReRun}
            startIcon={<Iconify icon="mdi:play-circle-outline" />}
            variant="contained"
            color="primary"
            sx={{ mr: 'auto' }}
          >
            Re-run
          </Button>
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