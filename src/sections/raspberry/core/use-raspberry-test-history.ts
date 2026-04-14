import { useState, useEffect, useCallback, useMemo } from 'react';

import { fetchRaspberryHistory } from '../hooks/use-raspberry-axios';

export interface HistoryItem {
  id: string;
  scenario: string;
  startTime: string;
  duration: string;
  rawDuration: number;
  status: 'COMPLETED' | 'ABORTED' | 'ERROR';
  rawId: number;
  passedCount: number;
  failedCount: number;
}

export const STATUS_OPTIONS = ['All Status', 'COMPLETED', 'ABORTED', 'ERROR'];

export function useTestHistory(ipAddress: string) {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [filterScenario, setFilterScenario] = useState('All Scenarios');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState(STATUS_OPTIONS[0]);

  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>('startTime');

  const fetchHistory = useCallback(async () => {
    if (!ipAddress) return;
    setIsLoading(true);
    try {
      const response = await fetchRaspberryHistory(ipAddress);
      const items = response.data || [];
      const formattedData: HistoryItem[] = items.map((item: any) => {
        const startDate = item.started_at ? new Date(item.started_at) : null;

        let startStr = 'N/A';
        if (startDate) {
          startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;
        }

        const rawSeconds = parseFloat(item.duration) || 0;
        const minutes = Math.floor(rawSeconds / 60);
        // 소수점 둘째 자리까지 표기하되, .00인 경우 불필요한 소수점은 없앰
        const seconds = parseFloat((rawSeconds % 60).toFixed(2));
        const formattedDuration = `${minutes}m ${seconds}s`;

        return {
          id: `T-${String(item.id).padStart(4, '0')}`,
          rawId: item.id,
          scenario: item.name || 'Unknown Scenario',
          startTime: startStr,
          duration: formattedDuration,
          rawDuration: rawSeconds,
          status: item.status,
          passedCount: item.passed_count || 0,
          failedCount: item.failed_count || 0,
        };
      });
      setHistoryData(formattedData);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [ipAddress]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const scenarioOptions = useMemo(() => [
    'All Scenarios', ...Array.from(new Set(historyData.map((item) => item.scenario)))
  ], [historyData]);

  const filteredHistory = useMemo(() => historyData.filter(
      (row) =>
        (filterScenario === 'All Scenarios' || row.scenario === filterScenario) &&
        (filterDate === '' || row.startTime.startsWith(filterDate)) &&
        (filterStatus === 'All Status' || row.status === filterStatus)
  ), [historyData, filterScenario, filterDate, filterStatus]);

  const sortedHistory = useMemo(() => [...filteredHistory].sort((a, b) => {
      if (orderBy === 'duration') {
        return order === 'asc' ? a.rawDuration - b.rawDuration : b.rawDuration - a.rawDuration;
      }
      if (orderBy === 'startTime') {
        const aTime = a.startTime === 'N/A' ? 0 : new Date(a.startTime).getTime();
        const bTime = b.startTime === 'N/A' ? 0 : new Date(b.startTime).getTime();
        return order === 'asc' ? aTime - bTime : bTime - aTime;
      }
      return 0;
    }), [filteredHistory, order, orderBy]);

  const paginatedData = useMemo(() =>
    sortedHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  , [sortedHistory, page, rowsPerPage]);

  const handleClearFilters = useCallback(() => {
    setFilterDate('');
    setFilterScenario('All Scenarios');
    setFilterStatus(STATUS_OPTIONS[0]);
    setPage(0);
  }, []);

  const handleSort = useCallback(
    (property: string) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    },
    [order, orderBy]
  );

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  return {
    isLoading,
    paginatedData,
    totalFilteredCount: filteredHistory.length,
    scenarioOptions,
    statusOptions: STATUS_OPTIONS,
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
    fetchHistory,
    handleClearFilters,
    handleSort,
    handleChangePage,
    handleChangeRowsPerPage,
    isFiltered: filterDate !== '' || filterScenario !== 'All Scenarios' || filterStatus !== STATUS_OPTIONS[0],
  };
}