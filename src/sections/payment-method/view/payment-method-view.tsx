import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import axiosInstance from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { ConfirmDialog } from '../confirm-dialog';
import { EditConfirmDialog } from './confirm-dialog';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableHead } from '../payment-method-table-head';
import { PaymentMethodDialog } from '../payment-method-dialog';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { UserTableToolbar } from '../payment-method-table-toolbar';
import { PaymentMethodTableRow } from '../payment-method-table-row';

import type { PaymentMethodProps } from '../payment-method-table-row';

// ----------------------------------------------------------------------

export function PaymentMethodView() {
  const table = useTable();

  const [payment, setPayment] = useState<PaymentMethodProps[]>([]);
  const [filterName, setFilterName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethodProps | undefined>(undefined);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<PaymentMethodProps | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axiosInstance.get('finance/payment-methods', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      console.log(response.data);
      setPayment(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const handleEditRow = useCallback((row: PaymentMethodProps) => {
    setCurrentPaymentMethod(row);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setCurrentPaymentMethod(undefined);
  }, []);

  const handleDeleteRow = useCallback((row: PaymentMethodProps) => {
    setPaymentMethodToDelete(row);
    setOpenConfirm(true);
  }, []);

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setPaymentMethodToDelete(null);
  };

  const handleDelete = useCallback(async () => {
    console.log("handleDelete called", paymentMethodToDelete);
    if (!paymentMethodToDelete) return;
    try {
      const accessToken = localStorage.getItem('accessToken');
      await axiosInstance.delete(`finance/payment-methods/${paymentMethodToDelete.payment_method_id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Payment method deleted successfully");
      setSnackbar({ open: true, message: 'Delete success!', severity: 'success' });
      fetchPaymentMethods();
      table.onSelectAllRows(false, []);
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      setSnackbar({ open: true, message: 'Failed to delete payment method', severity: 'error' });
    } finally {
      handleCloseConfirm();
    }
  }, [paymentMethodToDelete, fetchPaymentMethods, table]);

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const dataFiltered: PaymentMethodProps[] = applyFilter({
    inputData: payment,
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
          Payment Method
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenDialog(true)}
        >
          Add Payment Method
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
                rowCount={payment.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    payment.map((row) => row.payment_method_id)
                  )
                }
                headLabel={[
                  { id: 'method_name', label: 'Method Name' },
                  { id: 'provider', label: 'Provider' },
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
                    <PaymentMethodTableRow
                      key={row.payment_method_id}
                      row={row}
                      selected={table.selected.includes(row.payment_method_id)}
                      onSelectRow={() => table.onSelectRow(row.payment_method_id)}
                      onEditRow={() => handleEditRow(row)}
                      onDeleteRow={() => handleDeleteRow(row)}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, payment.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={payment.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <PaymentMethodDialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        onUpdate={fetchPaymentMethods} 
        currentPaymentMethod={currentPaymentMethod}
      />

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Delete Payment Method"
        content={
          <>
            Are you sure you want to delete <strong>{paymentMethodToDelete?.method_name}</strong>?
          </>
        }
      />

      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
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
