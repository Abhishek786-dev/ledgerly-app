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

import type { PaymentMethodProps } from './payment-method-table-row';

// ----------------------------------------------------------------------



type PaymentMethodDialogProps = {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void; // to refresh the list after add/edit
  currentPaymentMethod?: PaymentMethodProps; // undefined for add, defined for edit
};

export function PaymentMethodDialog({ open, onClose, onUpdate, currentPaymentMethod }: PaymentMethodDialogProps) {
  // edit form population
  const getInitialFormData = useCallback(() => ({
    method_name: '',
    provider: '',
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

  // edit form population
  useEffect(() => {
    if (open) {
      if (currentPaymentMethod) {
        setFormData({
          method_name: currentPaymentMethod.method_name,
          provider: currentPaymentMethod.provider,
          is_active: currentPaymentMethod.is_active,
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [open, currentPaymentMethod, getInitialFormData]);

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

  // edit form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        console.log('Submitting form data:', formData);
      const accessToken = localStorage.getItem('accessToken');
      
      if (currentPaymentMethod) {
        await axiosInstance.put(`finance/payment-methods/${currentPaymentMethod.payment_method_id}/`, formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setSnackbar({ open: true, message: 'Payment Method updated successfully!', severity: 'success' });
      } else {
        await axiosInstance.post('finance/payment-methods/', formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setSnackbar({ open: true, message: 'Payment Method added successfully!', severity: 'success' });
      }

      onUpdate();
      onClose();
      setFormData(getInitialFormData());
      // Reset form or handle success feedback here
    } catch (error: any) {
      console.error('Failed to add payment method:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to add payment method',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{currentPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>

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
            label="Method Name"
            name="method_name"
            value={formData.method_name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Provider"
            name="provider"
            value={formData.provider}
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
        <LoadingButton onClick={handleSubmit} variant="contained" loading={isSubmitting}>
          {currentPaymentMethod ? 'Update' : 'Add'}
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
