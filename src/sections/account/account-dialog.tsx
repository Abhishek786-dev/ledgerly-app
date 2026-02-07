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

// ----------------------------------------------------------------------



type AccountDialogProps = {
  currentAccount?: {
    account_id: string;
    account_name: string;
    account_type: string;
    bank_name: string;
    current_balance: number;
    opening_balance: number;
    is_active: boolean;
  };
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

export function AccountDialog({ open, onClose, onUpdate, currentAccount }: AccountDialogProps) {
  const getInitialFormData = useCallback((account?: AccountDialogProps['currentAccount']) => ({
    account_id: account?.account_id || '',
    account_name: '',
    account_type: '',
    bank_name: '',
    // Ensure these are numbers if the backend expects them as such
    current_balance: '',
    opening_balance: '',
    is_active: false,
    
  }), []);

  const [formData, setFormData] = useState(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (open) {
      if (currentAccount) {
        setFormData({
          account_id: currentAccount.account_id,
          account_name: currentAccount.account_name,
          account_type: currentAccount.account_type,
          bank_name: currentAccount.bank_name,
          current_balance: String(currentAccount.current_balance),
          opening_balance: String(currentAccount.opening_balance),
          is_active: currentAccount.is_active,
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [open, currentAccount, getInitialFormData]);

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
      const dataToSubmit = {
        ...formData,
        current_balance: Number(formData.current_balance),
        opening_balance: Number(formData.opening_balance),
      };

      if (formData.account_id) {
        // Editing existing account
        await axiosInstance.put(`finance/accounts/${formData.account_id}/`, dataToSubmit, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSnackbar({ open: true, message: 'Account updated successfully!', severity: 'success' });
      } else {
        // Adding new account
        await axiosInstance.post('finance/accounts/', dataToSubmit, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSnackbar({ open: true, message: 'Account added successfully!', severity: 'success' });
      }

      onUpdate();
      onClose();
      setFormData(getInitialFormData());
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" >
      <DialogTitle>{currentAccount ? 'Edit Account' : 'New Account'}</DialogTitle>

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
            label="Account Name"
            name="account_name"
            value={formData.account_name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            select
            label="Account Type"
            name="account_type"
            value={formData.account_type}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem key='cash' value='cash'>Cash</MenuItem>
            <MenuItem key='bank' value='bank'>Bank</MenuItem>
            <MenuItem key='credit' value='credit'>Credit</MenuItem>
            <MenuItem key='wallet' value='wallet'>Wallet</MenuItem>
            <MenuItem key='investment' value='investment'>Investment</MenuItem>
              
          </TextField>

          <TextField
            label="Bank Name"
            name="bank_name"
            value={formData.bank_name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Current Balance"
            name="current_balance"
            type="number"
            value={formData.current_balance}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Opening Balance"
            name="opening_balance"
            type="number"
            value={formData.opening_balance}
            onChange={handleChange}
            fullWidth
          />


          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_active}
                onChange={handleChange}
                name="is_active"
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <LoadingButton onClick={handleSubmit} variant="contained" loading={isSubmitting} >
          {formData.account_id ? 'Save Changes' : 'Add'}
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
