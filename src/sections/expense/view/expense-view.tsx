import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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
import { ExpenseDialog } from '../expense-dialog';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableHead } from '../expense-table-head';
import { ExpenseTableRow } from '../expense-table-row';
import { UserTableToolbar } from '../expense-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { ExpenseProps } from '../expense-table-row';

// ----------------------------------------------------------------------

export function ExpenseView() {
  const table = useTable();

  const [expenses, setExpenses] = useState<ExpenseProps[]>([]);
  const [filterName, setFilterName] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; expense?: ExpenseProps }>({ open: false });
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axiosInstance.get('expenses/transaction', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Handle Django paginated response (response.data.results) or direct array
      setExpenses(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleEditRow = useCallback((expense: ExpenseProps) => {
    setDialog({ open: true, expense });
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
      await axiosInstance.delete(`expenses/transaction/${deleteId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchExpenses();
      setOpenDelete(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const dataFiltered: ExpenseProps[] = applyFilter({
    inputData: expenses,
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
          Expenses
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setDialog({ open: true })}
        >
          New expense
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
                rowCount={expenses.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    expenses.map((row) => row.expense_id)
                  )
                }
                headLabel={[
                  { id: 'account', label: 'Account' },
                  { id: 'category', label: 'Category' },
                  { id: 'payment_method', label: 'Payment Method' },
                  { id: 'total_amount', label: 'Total Amount' },
                  { id: 'expense_date', label: 'Date' },
                  { id: 'is_recurring', label: 'Recurring', align: 'center' },
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
                    <ExpenseTableRow
                      key={row.expense_id}
                      row={row}
                      selected={table.selected.includes(row.expense_id)}
                      onSelectRow={() => table.onSelectRow(row.expense_id)}
                      onEditRow={handleEditRow}
                      onDeleteRow={() => handleDeleteRow(row.expense_id)}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, expenses.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={expenses.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <ExpenseDialog
        open={dialog.open}
        onClose={handleCloseDialog}
        onUpdate={fetchExpenses}
        currentExpense={dialog.expense}
      />

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Expense?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this expense? This action cannot be undone.
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
