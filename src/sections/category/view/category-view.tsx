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
import { CategoryDialog } from '../category-dialog';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableHead } from '../category-table-head';
import { CategoryTableRow } from '../category-table-row';
import { UserTableToolbar } from '../category-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { CategoryProps } from '../category-table-row';

// ----------------------------------------------------------------------

export function CategoryView() {
  const table = useTable();

  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [filterName, setFilterName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryProps | undefined>(undefined);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryProps | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axiosInstance.get('categories/list', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Handle Django paginated response (response.data.results) or direct array
      setCategories(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEditRow = useCallback((row: CategoryProps) => {
    setCurrentCategory(row);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setCurrentCategory(undefined);
  }, []);

  const handleDeleteRow = useCallback((row: CategoryProps) => {
    setCategoryToDelete(row);
    setOpenConfirm(true);
  }, []);

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setCategoryToDelete(null);
  };

  const handleDelete = useCallback(async () => {
    if (!categoryToDelete) return;
    try {
      const accessToken = localStorage.getItem('accessToken');
      // In your category-dialog.tsx, you are using 'categories/list/'. I am using it here for consistency.
      // If your delete endpoint is different (e.g., 'categories/'), please adjust it here.
      await axiosInstance.delete(`categories/list/${categoryToDelete.category_id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setSnackbar({ open: true, message: 'Delete success!', severity: 'success' });
      fetchCategories();
      table.onSelectAllRows(false, []);
    } catch (error) {
      console.error('Failed to delete category:', error);
      setSnackbar({ open: true, message: 'Failed to delete category', severity: 'error' });
    } finally {
      handleCloseConfirm();
    }
  }, [categoryToDelete, fetchCategories, table]);

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const dataFiltered: CategoryProps[] = applyFilter({
    inputData: categories,
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
          Category
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenDialog(true)}
        >
          New Category
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
                rowCount={categories.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    categories.map((row) => row.category_id)
                  )
                }
                headLabel={[
                  { id: 'category_name', label: 'Category Name' },
                  { id: 'category_type', label: 'Category Type' },
                  { id: 'category_detail_type', label: 'Category Detail Type' },
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
                    <CategoryTableRow
                      key={row.category_id}
                      row={row}
                      selected={table.selected.includes(row.category_id)}
                      onSelectRow={() => table.onSelectRow(row.category_id)}
                      onEditRow={() => handleEditRow(row)}
                      onDeleteRow={() => handleDeleteRow(row)}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, categories.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={categories.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <CategoryDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onUpdate={fetchCategories}
        currentCategory={currentCategory}
      />

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Delete Category"
        content={
          <p>
            Are you sure you want to delete <strong>{categoryToDelete?.category_name}</strong>?
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
