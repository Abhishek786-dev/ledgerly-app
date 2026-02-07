import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import DialogContentText from '@mui/material/DialogContentText';

import axiosInstance from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { AccountDialog } from '../account-dialog';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableHead } from '../account-table-head';
import { AccountTableRow } from '../account-table-row';
import { UserTableToolbar } from '../account-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { AccountProps } from '../account-table-row';

// ----------------------------------------------------------------------

export function AccountView() {
  const table = useTable();

  const [accounts, setAccounts] = useState<AccountProps[]>([]);;
  const [filterName, setFilterName] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; account?: AccountProps }>({ open: false });
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axiosInstance.get('finance/accounts', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Handle Django paginated response (response.data.results) or direct array
      setAccounts(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleEditRow = useCallback((account: AccountProps) => {
    setDialog({ open: true, account });
  }, []);

  const handleCloseDialog = () => {
    setDialog({ open: false });
  };

  const handleDeleteRow = useCallback((id: string) => {
    setDeleteId(id);
    setOpenDelete(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const accessToken = localStorage.getItem('accessToken');
      await axiosInstance.delete(`finance/accounts/${deleteId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchAccounts();
      setOpenDelete(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const dataFiltered: AccountProps[] = applyFilter({
    inputData: accounts,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

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
          Account
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setDialog({ open: true })}
        >
          New Account
        </Button>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={accounts.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    accounts.map((row) => row.account_id)
                  )
                }
                headLabel={[
                  { id: 'account_name', label: 'Account Name' },
                  { id: 'account_type', label: 'Account Type' },
                  { id: 'bank_name', label: 'Bank Name' },
                  { id: 'current_balance', label: 'Current Balance' },
                  { id: 'opening_balance', label: 'Opening Balance' },
                  { id: 'is_active', label: 'Active', align: 'center' },
                  { id:''},
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <AccountTableRow
                      key={row.account_id}
                      row={row}
                      selected={table.selected.includes(row.account_id)}
                      onSelectRow={() => table.onSelectRow(row.account_id)}
                      onEditRow={() => handleEditRow(row)}
                      onDeleteRow={() => handleDeleteRow(row.account_id)}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, accounts.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={accounts.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <AccountDialog
        open={dialog.open}
        onClose={handleCloseDialog}
        onUpdate={fetchAccounts}
        currentAccount={dialog.account}
      />

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
