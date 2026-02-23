// src/sections/expense/expense-dialog.tsx

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import axiosInstance from 'src/utils/axios';

import type { ExpenseProps } from './expense-table-row';

// ----------------------------------------------------------------------

// NOTE: The user mentioned 'vendor', so a placeholder is provided.
// You will need to add a 'vendor' field to your form state and API submission if required.
type VendorOption = {
  vendor_id: string;
  vendor_name: string;
  vendor_type: string;
  default_category: {
    category_id: string;
    category_name: string;
  };
  is_active: boolean;

};

type AccountOption = {
  account_id: string;
  account_name: string;
};

type CategoryOption = {
  category_id: string;
  category_name: string;
};

type PaymentMethodOption = {
  payment_method_id: string;
  method_name: string;
};

type ExpenseDialogProps = {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentExpense?: ExpenseProps;
};

export function ExpenseDialog({ open, onClose, onUpdate, currentExpense }: ExpenseDialogProps) {
  const getInitialFormData = useCallback((expense?: ExpenseProps) => ({
    account_id: expense?.account?.account_id || '',
    category_id: expense?.category?.category_id || '',
    vendor_id: expense?.vendor?.vendor_id,
    payment_method_id: expense?.payment_method?.payment_method_id || '',
    total_amount: expense?.total_amount?.toString() || '',
    expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
    is_recurring: expense?.is_recurring || false,
    notes: expense?.notes || '',
  }), []);

  const [formData, setFormData] = useState(getInitialFormData(currentExpense));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      if (open) {
        setFormData(getInitialFormData(currentExpense));
        try {
          const accessToken = localStorage.getItem('accessToken');
          const config = {
            headers: { Authorization: `Bearer ${accessToken}` },
          };

          const [accountsRes, categoriesRes, paymentMethodsRes, vendorsRes ] =
            await Promise.all([
              axiosInstance.get('finance/accounts/', config),
              axiosInstance.get('categories/list', config),
              axiosInstance.get('finance/payment-methods/', config),
              axiosInstance.get('categories/vendors/', config),
            ]);
          console.log(JSON.stringify(vendorsRes.data));
          console.log(JSON.stringify(accountsRes.data));
          console.log(JSON.stringify(categoriesRes.data));
          console.log(JSON.stringify(paymentMethodsRes.data));

          setVendors(vendorsRes.data.results || vendorsRes.data);
          setAccounts(accountsRes.data.results || accountsRes.data || []);
          setCategories(categoriesRes.data.results || categoriesRes.data || []);
          setPaymentMethods(paymentMethodsRes.data.results || paymentMethodsRes.data || []);
          setVendors(vendorsRes.data.results || vendorsRes.data || []);
        } catch (error) {
          console.error('Failed to fetch dropdown data:', error);
        }
      }
    };
    fetchDropdownData();
  }, [open, getInitialFormData, currentExpense]);

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        console.log('Submitting form data:', formData);
      const accessToken = localStorage.getItem('accessToken');
      
      if (currentExpense) {
        await axiosInstance.put(`expenses/transaction/${currentExpense.expense_id}/`, formData, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSnackbar({ open: true, message: 'Expense updated successfully!', severity: 'success' });
      } else {
        await axiosInstance.post('expenses/transaction/', formData, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSnackbar({ open: true, message: 'Expense added successfully!', severity: 'success' });
      }

      onUpdate();
      onClose();
      setFormData(getInitialFormData());
      
      // Reset form or handle success feedback here
    } catch (error: any) {
      console.error('Failed to add expense:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to add expense',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{currentExpense ? 'Edit Expense' : 'New Expense'}</DialogTitle>

      <DialogContent>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            label="Total Amount"
            name="total_amount"
            type="number"
            value={formData.total_amount}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Date"
            name="expense_date"
            type="date"
            value={formData.expense_date}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label="Account"
            name="account_id"
            value={formData.account_id}
            onChange={handleChange}
            fullWidth
            required
          >
            {accounts.map((option) => (
              <MenuItem key={option.account_id} value={option.account_id}>
                {option.account_name}
              </MenuItem>
            ))}
          </TextField>

          {
          // Uncomment this block to add a Vendor dropdown
          <TextField
            select
            label="Vendor"
            name="vendor_id"
            value={formData.vendor_id}
            onChange={handleChange}
            fullWidth
          >
            {vendors.map((option) => (
              <MenuItem key={option.vendor_id} value={option.vendor_id}>
                {option.vendor_name} - {option.vendor_type} - {option.default_category.category_name}
              </MenuItem>
            ))}
          </TextField>
         }

          <TextField
            select
            label="Category"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            fullWidth
            required
          >
            {categories.map((option) => (
              <MenuItem key={option.category_id} value={option.category_id}>
                {option.category_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Payment Method"
            name="payment_method_id"
            value={formData.payment_method_id}
            onChange={handleChange}
            fullWidth
            required
          >
            {paymentMethods.map((option) => (
              <MenuItem key={option.payment_method_id} value={option.payment_method_id}>
                {option.method_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_recurring}
                onChange={handleChange}
                name="is_recurring"
              />
            }
            label="Recurring Expense"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <LoadingButton onClick={handleSubmit} variant="contained" loading={isSubmitting}>
          {currentExpense ? 'Save' : 'Add'}
        </LoadingButton>
      </DialogActions>
    </Dialog>

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
    </>
  );
}
