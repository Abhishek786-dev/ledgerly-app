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
import { VendorDialog } from '../vendor-dialog';
import { ConfirmDialog } from '../confirm-dialog';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableHead } from '../vendor-table-head';
import { VendorTableRow } from '../vendor-table-row';
import { UserTableToolbar } from '../vendor-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { VendorProps } from '../vendor-table-row';

// ----------------------------------------------------------------------

export function VendorView() {
  const table = useTable();

  const [vendors, setVendors] = useState<VendorProps[]>([]);
  const [filterName, setFilterName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<VendorProps | undefined>(undefined);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<VendorProps | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  const fetchVendors = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axiosInstance.get('categories/vendors/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Handle Django paginated response (response.data.results) or direct array
      setVendors(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleEditRow = useCallback((row: VendorProps) => {
    setCurrentVendor(row);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setCurrentVendor(undefined);
  }, []);

  const handleDeleteRow = useCallback((row: VendorProps) => {
    setVendorToDelete(row);
    setOpenConfirm(true);
  }, []);

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setVendorToDelete(null);
  };

  const handleDelete = useCallback(async () => {
    if (!vendorToDelete) return;
    try {
      const accessToken = localStorage.getItem('accessToken');
      await axiosInstance.delete(`categories/vendors/${vendorToDelete.vendor_id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setSnackbar({ open: true, message: 'Delete success!', severity: 'success' });
      fetchVendors();
      table.onSelectAllRows(false, []);
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      setSnackbar({ open: true, message: 'Failed to delete vendor', severity: 'error' });
    } finally {
      handleCloseConfirm();
    }
  }, [vendorToDelete, fetchVendors, table]);

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const dataFiltered: VendorProps[] = applyFilter({
    inputData: vendors,
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
          Vendor
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenDialog(true)}
        >
          New Vendor
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
                rowCount={vendors.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    vendors.map((row) => row.vendor_id)
                  )
                }
                headLabel={[
                  { id: 'vendor_name', label: 'Vendor Name' },
                  { id: 'vendor_type', label: 'Vendor Type' },
                  { id: 'default_category', label: 'Default Category' },
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
                    <VendorTableRow
                      key={row.vendor_id}
                      row={row}
                      selected={table.selected.includes(row.vendor_id)}
                      onSelectRow={() => table.onSelectRow(row.vendor_id)}
                      onEditRow={() => handleEditRow(row)}
                      onDeleteRow={() => handleDeleteRow(row)}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, vendors.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={vendors.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <VendorDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onUpdate={fetchVendors}
        currentVendor={currentVendor}
      />

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Delete Vendor"
        content={
          <p>
            Are you sure you want to delete <strong>{vendorToDelete?.vendor_name}</strong>?
          </p>
        }
      />

      {snackbar && (
        <Snackbar
          open
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
